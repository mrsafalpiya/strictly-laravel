<?php

namespace App\Support\Wayfinder;

use App\Support\Data\InputData;
use App\Support\Data\QueryData;
use App\Support\Inertia\Page;
use Illuminate\Support\Collection;
use Laravel\Wayfinder\Parameter;
use ReflectionMethod;
use ReflectionNamedType;
use Spatie\LaravelData\Data;

/**
 * Called from the Wayfinder template overrides in resources/views/vendor/wayfinder: types each
 * generated route function by the controller action's laravel-data parameters.
 *
 *     public function index(IssueFiltersData $filters)   (QueryData)
 *       → index(workspace, { query: { statuses: ['todo'] } })      query is Partial<IssueFiltersData>
 *
 *     public function store(StoreLabelData $data)        (InputData)
 *       → store.form(workspace)                                    branded with StoreLabelData,
 *         so <TypedForm {...store.form(workspace)}> types its errors and field names
 *
 *     public function __invoke(...): SearchResultsData   (JSON endpoint)
 *       → search(workspace)                                        branded with SearchResultsData,
 *         so useHttp<InputOf<typeof search>, ResponseOf<typeof search>>() needs no hand-picked types
 */
final class RouteTypes
{
    /**
     * The route parameters argument (`args: { workspace: …, project: … } | [workspace: …, project: …], `), as
     * Wayfinder's template writes it but on one line (its output formatter can't indent nested parentheses), with
     * every parameter bound to a model taking that model's route key only (`RouteKey<'Project', string>`, see
     * RouteKeys), not any string or any object with a `key`.
     *
     * @param  Collection<int, Parameter>  $parameters
     */
    public static function arguments(Collection $parameters, string $args): string
    {
        if ($parameters->isEmpty()) {
            return '';
        }

        $type = function (Parameter $parameter): string {
            $model = RouteKeys::boundModel($parameter->bound);
            $type = $model === null ? $parameter->types : sprintf("import('@/lib/routes').RouteKey<'%s', %s>", class_basename($model), $parameter->types);

            return $parameter->key === null ? $type : sprintf('%s | { %s: %s }', $type, $parameter->key, $type);
        };

        return sprintf(
            '%s%s: { %s } | [%s]%s, ',
            $args,
            $parameters->every(fn (Parameter $parameter): bool => $parameter->optional) ? '?' : '',
            $parameters->map(fn (Parameter $parameter): string => $parameter->name.($parameter->optional ? '?' : '').': '.$type($parameter))->implode(', '),
            $parameters->map(fn (Parameter $parameter): string => $parameter->safeName().': '.$type($parameter))->implode(', '),
            $parameters->count() === 1 ? ' | '.$type($parameters->firstOrFail()) : '',
        );
    }

    /** The TS type of the `options` argument. */
    public static function queryOptions(string $controller, string $method, bool $invokable): string
    {
        $declared = self::declared($controller, $method);
        $query = $declared !== null && is_subclass_of($declared, QueryData::class)
            ? class_basename($declared)
            : self::parameter($controller, $method, $invokable, QueryData::class);

        return $query === null
            ? 'RouteQueryOptions'
            : sprintf("import('@/lib/routes').QueryOptions<import('@/types').%s>", $query);
    }

    /**
     * Appended to the route's return types as phantom brands: the request payload (InputData parameter)
     * and, for JSON endpoints, the response (declared Data return type).
     */
    public static function brands(string $controller, string $method, bool $invokable): string
    {
        $input = self::inputClass($controller, $method, $invokable);
        $input = $input === null ? null : class_basename($input);
        $response = self::responseOf($controller, $method, $invokable);

        return ($input === null ? '' : sprintf(" & import('@/lib/routes').WithInput<import('@/types').%s>", $input))
            .($response === null ? '' : sprintf(" & import('@/lib/routes').WithResponse<%s>", self::responseTypeScript($response)));
    }

    /**
     * The response a JSON endpoint declares: its controller method's Data return type (Pages excluded), or for
     * controllers you don't own the entry in config/types.php `route_responses` — a Data class, or a TypeScript
     * type for JSON that isn't an object (`'string[]'`). Also used by the test contract recorder.
     *
     * @return class-string<Data>|string|null
     */
    public static function responseOf(string $controller, string $method, bool $invokable = false): ?string
    {
        $declared = config('types.route_responses.'.ltrim($controller, '\\').'@'.($invokable ? '__invoke' : $method));

        if (is_string($declared)) {
            return $declared;
        }

        $type = self::method($controller, $method, $invokable)?->getReturnType();
        $class = $type instanceof ReflectionNamedType && ! $type->isBuiltin() ? $type->getName() : null;

        return $class !== null && is_subclass_of($class, Data::class) && ! is_subclass_of($class, Page::class) ? $class : null;
    }

    /** The TypeScript of a declared response (see responseOf()). */
    public static function responseTypeScript(string $response): string
    {
        return class_exists($response) ? "import('@/types').".class_basename($response) : $response;
    }

    /**
     * The payload class of a controller action: declared in config/types.php for controllers you don't own,
     * otherwise the action's InputData parameter. Also used by the test contract recorder.
     *
     * @return class-string|null
     */
    public static function inputClass(string $controller, string $method, bool $invokable = false): ?string
    {
        $declared = self::declared($controller, $method);

        if ($declared !== null) {
            return $declared;
        }

        foreach (self::method($controller, $method, $invokable)?->getParameters() ?? [] as $parameter) {
            $type = $parameter->getType();

            if ($type instanceof ReflectionNamedType && is_subclass_of($type->getName(), InputData::class)) {
                return $type->getName();
            }
        }

        return null;
    }

    /**
     * The payload declared in config/types.php for a controller you don't own.
     *
     * @return class-string|null
     */
    private static function declared(string $controller, string $method): ?string
    {
        $declared = config('types.route_inputs.'.ltrim($controller, '\\').'@'.$method);

        return is_string($declared) && class_exists($declared) ? $declared : null;
    }

    /**
     * The TS name (class basename) of the action's first parameter extending $base.
     *
     * @param  class-string  $base
     */
    private static function parameter(string $controller, string $method, bool $invokable, string $base): ?string
    {
        foreach (self::method($controller, $method, $invokable)?->getParameters() ?? [] as $parameter) {
            $type = $parameter->getType();

            if ($type instanceof ReflectionNamedType && is_subclass_of($type->getName(), $base)) {
                return class_basename($type->getName());
            }
        }

        return null;
    }

    private static function method(string $controller, string $method, bool $invokable): ?ReflectionMethod
    {
        $class = ltrim($controller, '\\');
        $method = $invokable ? '__invoke' : $method;

        if ($class === 'Closure' || ! class_exists($class) || ! method_exists($class, $method)) {
            return null;
        }

        return new ReflectionMethod($class, $method);
    }
}
