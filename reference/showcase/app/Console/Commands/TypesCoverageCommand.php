<?php

namespace App\Console\Commands;

use App\Data\FlashData;
use App\Data\SharedProps;
use App\Support\Data\InputData;
use App\Support\Inertia\Page;
use App\Support\Wayfinder\RouteTypes;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Enums\DataTypeKind;
use Spatie\LaravelData\Support\DataConfig;
use Spatie\LaravelData\Support\DataProperty;
use stdClass;
use Symfony\Component\Finder\Finder;

/**
 * Reports what the recorded contracts (tests/Support/InertiaContracts.php) never exercised: a type is
 * only proven by `tsc` for the values the feature tests actually produced.
 *
 * Errors (exit 1): a page no test renders, a deferred/lazy prop no test loads, a JSON endpoint or a
 * form endpoint (an action with an input type) no test calls, and a field of a payload declared in
 * config/types.php that the vendor never validates, reports an error for or reads, and a route-key brand a
 * response contradicted (a `RouteKey<'Project', …>` value that isn't a project's key). Warnings (exit 1 with
 * --strict): nullable fields only ever null, lists only ever empty, union variants never seen, optional
 * fields never sent — their shape is typed but unverified.
 */
#[Signature('types:coverage {--strict : Fail on warnings too}')]
#[Description('Report which page props, endpoints and shapes the recorded contracts never exercised')]
final class TypesCoverageCommand extends Command
{
    /** @var list<string> */
    private array $errors = [];

    /**
     * Unverified shapes, aggregated per Data class property (where the type lives and gets fixed):
     * a property counts as verified once any test produced a non-null / non-empty value for it.
     *
     * @var array<string, array{problem: string, where: array<string, true>, verified: bool}>
     */
    private array $shapes = [];

    public function handle(Router $router): int
    {
        // Pure analysis: don't touch the app's cache store (laravel-data caches class structures there,
        // and a fresh CI checkout has no database for the default `database` store).
        config(['cache.default' => 'array', 'data.structure_caching.cache.store' => 'array']);
        $config = app(DataConfig::class);
        $records = $this->records();

        if ($records === []) {
            $this->components->error('No recorded contracts: run the feature tests first (composer test).');

            return self::FAILURE;
        }

        $byComponent = [];
        $flashes = [];
        $responses = [];
        /** @var array<string, list<string>> $usedByAction */
        $usedByAction = [];
        /** @var array<string, string> $routeKeyFailures */
        $routeKeyFailures = [];

        foreach ($records as $record) {
            if (isset($record->flash) && $record->flash instanceof stdClass) {
                $flashes[] = $record->flash;
            }

            if (($record->kind ?? null) === 'validation' && is_string($record->action ?? null)) {
                // The fields the action validated, reported an error for, or read.
                $usedByAction[$record->action] = array_values([
                    ...($usedByAction[$record->action] ?? []),
                    ...array_filter((array) ($record->validated ?? []), is_string(...)),
                    ...array_filter((array) ($record->errors ?? []), is_string(...)),
                    ...array_filter((array) ($record->read ?? []), is_string(...)),
                ]);
            }

            if (($record->kind ?? null) === 'route-keys') {
                foreach (array_filter((array) ($record->failures ?? []), fn (mixed $failure): bool => $failure instanceof stdClass) as $failure) {
                    $data = $failure->data ?? null;
                    $property = $failure->property ?? null;
                    $model = $failure->model ?? null;
                    $field = $failure->field ?? null;

                    if (is_string($data) && is_string($property) && is_string($model) && is_string($field)) {
                        $label = class_basename($data).'.'.$property;
                        $routeKeyFailures[$label] ??= sprintf(
                            '%s is typed as a %s route key, but tests sent values no %s has as its %s, e.g. %s.',
                            $label, class_basename($model), class_basename($model), $field, json_encode($failure->value ?? null, JSON_THROW_ON_ERROR),
                        );
                    }
                }
            }

            if (($record->kind ?? null) === 'json' && is_string($record->class ?? null)) {
                $responses[$record->class][] = $record->response;
            }

            if (in_array($record->kind ?? null, ['page', 'partial'], true) && is_string($record->component ?? null)) {
                $byComponent[$record->component][] = $record;
            }
        }

        foreach ($this->pages() as $class => $component) {
            $seen = $byComponent[$component] ?? [];

            if (array_filter($seen, fn (stdClass $record): bool => $record->kind === 'page') === []) {
                $this->errors[] = "{$component}: no feature test renders this page.";

                continue;
            }

            $this->walk($config, $class, array_map(fn (stdClass $record): mixed => $record->props, $seen), $component, page: true);
        }

        $allProps = array_merge(...array_map(fn (array $seen): array => array_map(fn (stdClass $r): mixed => $r->props, $seen), array_values($byComponent)));
        $this->walk($config, SharedProps::class, $allProps, 'shared props');
        $this->walk($config, FlashData::class, $flashes, 'flash', optionalAllowed: true);

        foreach ($this->jsonEndpoints($router) as $response => $route) {
            if (! isset($responses[$response])) {
                $this->errors[] = "{$route}: no feature test calls this JSON endpoint (".class_basename($response).').';

                continue;
            }

            if (is_subclass_of($response, Data::class)) {
                $this->walk($config, $response, $responses[$response], class_basename($response));
            }
        }

        $this->checkPayloads($config, $router, $usedByAction);
        array_push($this->errors, ...array_values($routeKeyFailures));

        $this->report(count($records));

        $unverified = array_filter($this->shapes, fn (array $shape): bool => ! $shape['verified']);

        return $this->errors !== [] || ($this->option('strict') === true && $unverified !== []) ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Compares one Data class with every value the tests recorded for it, recursively.
     *
     * @param  class-string  $class
     * @param  array<int, mixed>  $values
     */
    private function walk(DataConfig $config, string $class, array $values, string $path, bool $page = false, bool $optionalAllowed = false): void
    {
        $objects = array_values(array_filter($values, fn (mixed $value): bool => $value instanceof stdClass));

        foreach ($config->getDataClass($class)->properties as $property) {
            if ($property->hidden) {
                continue;
            }

            $name = $property->outputMappedName ?? $property->name;
            $label = "{$path} › {$name}";
            $present = [];

            foreach ($objects as $object) {
                if (property_exists($object, $name)) {
                    $present[] = $object->{$name};
                }
            }

            $deferred = $property->type->lazyType !== null || $property->type->isOptional;

            if ($present === []) {
                match (true) {
                    $objects === [], $optionalAllowed => null,
                    $deferred && $page => $this->errors[] = "{$label}: deferred/lazy prop never loaded by a test (use ->loadDeferredProps() or a partial reload).",
                    default => $this->shape($class, $name, 'never sent', $path, verified: false),
                };

                continue;
            }

            $nonNull = array_values(array_filter($present, fn (mixed $value): bool => $value !== null));

            if ($property->type->isNullable || $deferred) {
                $this->shape($class, $name, 'only ever null', $path, verified: $nonNull !== []);
            }

            if ($nonNull !== []) {
                $this->scalarMembers($class, $property, $nonNull, $label);
                $this->walkValue($config, $class, $property, $nonNull, $label);
            }
        }
    }

    /**
     * @param  class-string  $owner
     * @param  list<mixed>  $values  non-null values of the property
     */
    private function walkValue(DataConfig $config, string $owner, DataProperty $property, array $values, string $label): void
    {
        $type = $property->type;
        $kind = $type->kind;

        if ($kind === DataTypeKind::DataObject) {
            $variants = array_values(array_filter(
                array_keys($type->type->getAcceptedTypes()),
                fn (string $accepted): bool => is_subclass_of($accepted, Data::class),
            ));

            if (count($variants) <= 1 && $type->dataClass !== null && class_exists($type->dataClass)) {
                $this->walk($config, $type->dataClass, $values, $label);

                return;
            }

            foreach ($variants as $variant) {
                $keys = $this->outputKeys($config, $variant);
                $matching = array_values(array_filter($values, fn (mixed $value): bool => $value instanceof stdClass && array_map(strval(...), array_keys(get_object_vars($value))) === $keys));

                $this->shape($owner, $property->name, 'union variant '.class_basename($variant).' never seen', $label, verified: $matching !== []);

                if ($matching !== []) {
                    $this->walk($config, $variant, $matching, $label.' ('.class_basename($variant).')');
                }
            }

            return;
        }

        $items = match (true) {
            in_array($kind, [DataTypeKind::DataPaginatedCollection, DataTypeKind::DataCursorPaginatedCollection, DataTypeKind::DataPaginator, DataTypeKind::DataCursorPaginator], true) => $this->flatten(array_map(fn (mixed $value): mixed => $value instanceof stdClass ? ($value->data ?? []) : [], $values)),
            $kind->isDataCollectable(), $kind === DataTypeKind::Array => $this->flatten($values),
            default => null,
        };

        if ($items === null) {
            return;
        }

        $this->shape($owner, $property->name, 'only ever empty', $label, verified: $items !== []);

        if ($items === []) {
            return;
        }

        if ($kind !== DataTypeKind::Array && $type->dataClass !== null && class_exists($type->dataClass)) {
            $this->walk($config, $type->dataClass, $items, $label.'[]');
        }
    }

    /**
     * Every action with an input type is exercised by a test; every field of a payload declared in
     * config/types.php (for controllers you don't own) is validated or read by the vendor in some test.
     *
     * @param  array<string, list<string>>  $usedByAction
     */
    private function checkPayloads(DataConfig $config, Router $router, array $usedByAction): void
    {
        $declared = config('types.route_inputs');
        $declared = is_array($declared) ? $declared : [];

        foreach ($router->getRoutes()->getRoutes() as $route) {
            $controller = $route->getControllerClass();

            if ($controller === null || ! class_exists($controller)) {
                continue;
            }

            $method = $route->getActionMethod() === $controller ? '__invoke' : $route->getActionMethod();
            $action = $controller.'@'.$method;
            $input = RouteTypes::inputClass($controller, $method);

            if ($input === null) {
                continue;
            }

            if (! isset($usedByAction[$action])) {
                $this->errors[] = sprintf('%s (%s): no feature test submits to this action.', $route->getName() ?? $route->uri(), class_basename($input));

                continue;
            }

            if (! array_key_exists($action, $declared)) {
                continue;
            }

            $used = array_map(fn (string $key): string => Str::before($key, '.'), $usedByAction[$action]);

            foreach ($config->getDataClass($input)->properties as $property) {
                if (! in_array($property->inputMappedName ?? $property->name, $used, true)) {
                    $this->errors[] = sprintf(
                        '%s.%s: declared in config/types.php for %s, but no test saw the vendor validate or read it (misnamed? or not a field the vendor uses).',
                        class_basename($input), $property->name, $action,
                    );
                }
            }
        }
    }

    /**
     * @param  class-string  $class
     */
    private function shape(string $class, string $property, string $problem, string $where, bool $verified): void
    {
        // Input classes only appear as form defaults/filters, which are empty by design.
        if (is_subclass_of($class, InputData::class)) {
            return;
        }

        $name = is_subclass_of($class, Page::class) ? Page::typeScriptNameFor($class) : class_basename($class);
        $key = $name.'.'.$property.': '.$problem;
        $this->shapes[$key] ??= ['problem' => $problem, 'where' => [], 'verified' => false];
        $this->shapes[$key]['where'][$where] = true;
        $this->shapes[$key]['verified'] = $this->shapes[$key]['verified'] || $verified;
    }

    /**
     * A union of scalars (`int|string`) is only proven for the members a test produced: each one must be seen.
     *
     * @param  class-string  $class
     * @param  list<mixed>  $values
     */
    private function scalarMembers(string $class, DataProperty $property, array $values, string $label): void
    {
        $members = array_values(array_intersect(array_keys($property->type->type->getAcceptedTypes()), ['int', 'float', 'string', 'bool']));

        if (count($members) < 2) {
            return;
        }

        $seen = array_unique(array_map(fn (mixed $value): string => match (true) {
            is_int($value) => 'int',
            is_float($value) => 'float',
            is_bool($value) => 'bool',
            default => 'string',
        }, $values));

        foreach ($members as $member) {
            $this->shape($class, $property->name, "union member {$member} never seen", $label, verified: in_array($member, $seen, true));
        }
    }

    /**
     * @param  class-string  $class
     * @return list<string>
     */
    private function outputKeys(DataConfig $config, string $class): array
    {
        $keys = [];

        foreach ($config->getDataClass($class)->properties as $property) {
            if (! $property->hidden) {
                $keys[] = $property->outputMappedName ?? $property->name;
            }
        }

        return $keys;
    }

    /**
     * @param  list<mixed>  $values
     * @return list<mixed>
     */
    private function flatten(array $values): array
    {
        $items = [];

        foreach ($values as $value) {
            if (is_array($value)) {
                array_push($items, ...array_values($value));
            } elseif ($value instanceof stdClass) {
                array_push($items, ...array_values(get_object_vars($value)));
            }
        }

        return $items;
    }

    /**
     * @return list<stdClass>
     */
    private function records(): array
    {
        $directory = resource_path('js/__contracts__');

        if (! is_dir($directory)) {
            return [];
        }

        $records = [];

        foreach (Finder::create()->files()->in($directory)->name('*.json') as $file) {
            $record = json_decode($file->getContents(), false);

            if ($record instanceof stdClass) {
                $records[] = $record;
            }
        }

        return $records;
    }

    /**
     * @return array<class-string, string> Page class => component
     */
    private function pages(): array
    {
        $pages = [];

        foreach (Finder::create()->files()->in(app_path('Pages'))->name('*Page.php') as $file) {
            $class = Page::NAMESPACE.Str::of($file->getRelativePathname())->replace('/', '\\')->beforeLast('.php')->value();

            if (class_exists($class) && is_subclass_of($class, Page::class)) {
                $pages[$class] = Page::componentFor($class);
            }
        }

        ksort($pages);

        return $pages;
    }

    /**
     * Routes whose controller action declares a response (RouteTypes::responseOf()).
     *
     * @return array<string, string> Data class or TypeScript type => route name or URI
     */
    private function jsonEndpoints(Router $router): array
    {
        $endpoints = [];

        foreach ($router->getRoutes()->getRoutes() as $route) {
            $controller = $route->getControllerClass();

            if ($controller === null || ! class_exists($controller)) {
                continue;
            }

            $response = RouteTypes::responseOf($controller, $route->getActionMethod() === $controller ? '__invoke' : $route->getActionMethod());

            if ($response !== null) {
                $endpoints[$response] = $route->getName() ?? $route->uri();
            }
        }

        return $endpoints;
    }

    private function report(int $records): void
    {
        foreach ($this->errors as $error) {
            $this->components->error($error);
        }

        $unverified = array_filter($this->shapes, fn (array $shape): bool => ! $shape['verified']);
        ksort($unverified);

        foreach ($unverified as $key => $shape) {
            $this->components->warn($key.'  (at '.implode(', ', array_keys($shape['where'])).')');
        }

        $this->components->info(sprintf(
            '%d recorded contracts: %d errors, %d unverified shapes%s.',
            $records,
            count($this->errors),
            count($unverified),
            $this->option('strict') === true ? ' (strict)' : '',
        ));
    }
}
