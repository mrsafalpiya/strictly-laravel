<?php

namespace Tests\Support;

use App\Support\Inertia\Page;
use App\Support\Wayfinder\RouteTypes;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ViewErrorBag;
use Illuminate\Validation\Validator as ValidatorInstance;
use Inertia\Support\Header;
use Inertia\Support\SessionKey;
use Spatie\LaravelData\Data;
use Symfony\Component\HttpFoundation\Response;

/**
 * Records what the server *actually* sent during feature tests as TypeScript "contracts", so `tsc`
 * proves the generated types are true. No per-test code is needed; every request is inspected:
 *
 *  - Inertia page          export const props = {…} satisfies PageContract<'settings/profile'>;
 *  - partial reload        … satisfies PartialPageContract<'issues/show', 'comments'>;   (requested keys must be present)
 *  - flash (incl. on redirects)  export const flash = {…} satisfies FlashData;
 *  - JSON endpoint whose controller declares a Data return type (or config/types.php a response)
 *                          export const response = {…} satisfies Unbranded<SearchResultsData>;
 *  - validation            export const validated = ['title', 'labelIds.0'] satisfies InputKey<StoreIssueData>[];
 *                          export const errors = ['title'] satisfies InputKey<StoreIssueData>[];
 *                          export const read = ['remember'] satisfies InputKey<LoginFormData>[];
 *    Every field the server validates, every error key it returns and every input key it reads (InputReads) must
 *    be a field of the action's input type (its InputData parameter, or the payload declared in config/types.php)
 *    — so declared vendor payloads are checked against what the vendor really validates and reads, controllers
 *    can't invent non-field error keys, and no action reads a request key its input type doesn't declare.
 *
 * Route-key brands (`RouteKey<'Project', string>`) are checked against the database as Data objects are serialised
 * (RouteKeyChecks); a value that isn't an existing key of its model is recorded for types:coverage to report.
 *
 * Each contract also gets a `.json` sidecar that `php artisan types:coverage` reads to report what the
 * tests never exercised (pages, deferred props, endpoints, nullable fields only ever null, …).
 *
 * Output: resources/js/__contracts__ (gitignored). A sequential test run starts from an empty directory;
 * `composer test` clears it before parallel runs.
 */
final class InertiaContracts
{
    private static bool $cleared = false;

    /** @var list<string> Fields validated during the current request. */
    private static array $validated = [];

    public static function listen(): void
    {
        if (! self::$cleared && getenv('TEST_TOKEN') === false) {
            File::deleteDirectory(self::directory());
        }

        self::$cleared = true;

        Event::listen(RouteMatched::class, function (): void {
            self::$validated = [];
        });

        Validator::resolver(function (Translator $translator, array $data, array $rules, array $messages, array $attributes): ValidatorInstance {
            foreach ($rules as $key => $rule) {
                array_push(self::$validated, (string) $key, ...self::confirmationFields((string) $key, $rule));
            }

            return new ValidatorInstance($translator, $data, $rules, $messages, $attributes);
        });

        Event::listen(RequestHandled::class, function (RequestHandled $event): void {
            self::record($event->request, $event->response);
            self::recordValidation($event->request, $event->response);
            self::recordRouteKeys($event->request);
        });
    }

    public static function directory(): string
    {
        return resource_path('js/__contracts__');
    }

    private static function record(Request $request, Response $response): void
    {
        $page = self::page($response);

        if ($page !== null) {
            self::recordPage($request, $page);

            return;
        }

        if ($response instanceof RedirectResponse) {
            self::recordFlash($request);

            return;
        }

        if ($response instanceof JsonResponse && $response->isSuccessful()) {
            self::recordJson($request, $response);
        }
    }

    private static function recordPage(Request $request, object $page): void
    {
        if (! is_string($page->component ?? null) || ! is_object($page->props ?? null)) {
            return;
        }

        $only = self::headerList($request, Header::PARTIAL_ONLY);
        $except = self::headerList($request, Header::PARTIAL_EXCEPT);
        $component = self::quote($page->component);

        $contract = match (true) {
            $only !== [] && ! self::hasNestedKeys($only) => sprintf('PartialPageContract<%s, %s>', $component, implode(' | ', array_map(self::quote(...), $only))),
            $only !== [] || $except !== [] => "Partial<PageContract<{$component}>>",
            default => "PageContract<{$component}>",
        };

        $lines = [
            sprintf('// %s %s%s', $request->method(), $request->getRequestUri(), $only === [] ? '' : ' (partial reload: '.implode(', ', $only).')'),
            "import type { FlashData } from '@/types';",
            "import type { PageContract, PartialPageContract } from '@/types/contracts';",
            '',
            sprintf('export const props = %s satisfies %s;', self::json($page->props), $contract),
        ];

        if (isset($page->flash)) {
            $lines[] = sprintf('export const flash = %s satisfies FlashData;', self::json($page->flash));
        }

        self::write($page->component, $lines, [
            'kind' => $only === [] && $except === [] ? 'page' : 'partial',
            'component' => $page->component,
            'props' => $page->props,
            'flash' => $page->flash ?? null,
        ]);
    }

    /** Flash data set before a redirect is only rendered on the next page: check it here. */
    private static function recordFlash(Request $request): void
    {
        $flash = $request->hasSession() ? $request->session()->get(SessionKey::FLASH_DATA) : null;

        if (! is_array($flash) || $flash === []) {
            return;
        }

        self::write('_flash', [
            sprintf('// %s %s (redirect)', $request->method(), $request->getRequestUri()),
            "import type { FlashData } from '@/types';",
            '',
            sprintf('export const flash = %s satisfies FlashData;', self::json((object) $flash)),
        ], ['kind' => 'flash', 'flash' => (object) $flash]);
    }

    private static function recordJson(Request $request, JsonResponse $response): void
    {
        $route = $request->route();
        $controller = $route instanceof Route ? $route->getControllerClass() : null;

        if (! $route instanceof Route || $controller === null) {
            return;
        }

        $method = $route->getActionMethod() === $controller ? '__invoke' : $route->getActionMethod();
        $declared = RouteTypes::responseOf($controller, $method);

        if ($declared === null) {
            return;
        }

        $isClass = class_exists($declared);
        $type = $isClass ? class_basename($declared) : $declared;
        $body = json_decode((string) $response->getContent(), false);

        self::write('_json/'.($isClass ? $type : class_basename($controller).'@'.$method), [
            sprintf('// %s %s → %s', $request->method(), $request->getRequestUri(), $declared),
            ...($isClass ? ["import type { {$type} } from '@/types';"] : []),
            "import type { Unbranded } from '@/lib/routes';",
            '',
            sprintf('export const response = %s satisfies Unbranded<%s>;', self::json($body), $type),
        ], ['kind' => 'json', 'class' => $declared, 'response' => $body]);
    }

    /**
     * Fields validated and error keys returned by this request, checked against the action's input type.
     */
    private static function recordValidation(Request $request, Response $response): void
    {
        $route = $request->route();
        $controller = $route instanceof Route ? $route->getControllerClass() : null;

        if (! $route instanceof Route || $controller === null) {
            return;
        }

        $method = $route->getActionMethod() === $controller ? '__invoke' : $route->getActionMethod();
        $input = RouteTypes::inputClass($controller, $method);
        $nonEmpty = fn (string $key): bool => $key !== '';
        $validated = array_values(array_unique(array_filter(array_map(self::fieldPath(...), self::$validated), $nonEmpty)));
        $errors = array_values(array_unique(array_filter(array_map(self::fieldPath(...), self::errorKeys($request, $response)), $nonEmpty)));
        $read = InputReads::keys();

        if ($input === null && $validated === [] && $errors === [] && $read === []) {
            return;
        }

        $type = $input === null ? 'never' : 'InputKey<'.class_basename($input).'>';
        $lines = [
            sprintf('// %s %s → %s@%s', $request->method(), $request->getRequestUri(), $controller, $method),
            "import type { InputKey } from '@/lib/routes';",
            ...($input === null ? [] : ['import type { '.class_basename($input)." } from '@/types';"]),
            '',
            sprintf('export const validated = %s satisfies %s[];', self::json($validated), $type),
            sprintf('export const errors = %s satisfies %s[];', self::json($errors), $type),
            sprintf('export const read = %s satisfies %s[];', self::json($read), $type),
        ];

        self::write('_validation/'.class_basename($controller).'@'.$method, $lines, [
            'kind' => 'validation',
            'action' => $controller.'@'.$method,
            'input' => $input,
            'validated' => $validated,
            'errors' => $errors,
            'read' => $read,
        ]);
    }

    /** Route-key brands this request's Data objects violated (RouteKeyChecks); types:coverage reports them. */
    private static function recordRouteKeys(Request $request): void
    {
        $failures = RouteKeyChecks::failures();

        if ($failures === []) {
            return;
        }

        self::write('_route-keys', [
            sprintf('// %s %s', $request->method(), $request->getRequestUri()),
            ...array_map(fn (array $failure): string => sprintf('// %s.%s = %s: no %s has this %s', $failure['data'], $failure['property'], json_encode($failure['value'], JSON_THROW_ON_ERROR), $failure['model'], $failure['field']), $failures),
            'export {};',
        ], ['kind' => 'route-keys', 'failures' => $failures]);
    }

    /**
     * Error keys returned by a failed validation in this request (JSON 422 body, or flashed to the session).
     *
     * @return list<string>
     */
    private static function errorKeys(Request $request, Response $response): array
    {
        if ($response instanceof JsonResponse && $response->getStatusCode() === 422) {
            $body = json_decode((string) $response->getContent(), true);
            $errors = is_array($body) ? ($body['errors'] ?? []) : [];

            return is_array($errors) ? array_map(strval(...), array_keys($errors)) : [];
        }

        // By RequestHandled the session has aged its flash data: what this request flashed is in `_flash.old`
        // (errors flashed by an earlier request were already dropped).
        $flashed = $request->hasSession() ? [...(array) $request->session()->get('_flash.old', []), ...(array) $request->session()->get('_flash.new', [])] : [];

        if (! in_array('errors', $flashed, true)) {
            return [];
        }

        $bags = $request->session()->get('errors');
        $keys = [];

        if ($bags instanceof ViewErrorBag) {
            foreach ($bags->getBags() as $bag) {
                foreach ($bag->keys() as $key) {
                    $keys[] = is_string($key) ? $key : '';
                }
            }
        } elseif (is_array($bags)) {
            foreach ($bags as $bag) {
                $messages = is_array($bag) ? ($bag['messages'] ?? []) : [];
                array_push($keys, ...(is_array($messages) ? array_map(strval(...), array_keys($messages)) : []));
            }
        }

        return $keys;
    }

    /**
     * `confirmed` also validates `{field}_confirmation`, and `confirmed:other` validates `other`.
     *
     * @return list<string>
     */
    private static function confirmationFields(string $key, mixed $rule): array
    {
        $rules = is_string($rule) ? explode('|', $rule) : (is_array($rule) ? $rule : [$rule]);
        $fields = [];

        foreach ($rules as $item) {
            if (is_string($item) && ($item === 'confirmed' || str_starts_with($item, 'confirmed:'))) {
                $fields[] = $item === 'confirmed' ? $key.'_confirmation' : substr($item, strlen('confirmed:'));
            }
        }

        return $fields;
    }

    /** `labelIds.*` / `tasks.*.title` → `labelIds.0` / `tasks.0.title` (a concrete path of the input type). */
    private static function fieldPath(string $key): string
    {
        return str_replace('*', '0', $key);
    }

    /**
     * @param  list<string>  $lines
     * @param  array<string, mixed>  $meta
     */
    private static function write(string $directory, array $lines, array $meta): void
    {
        $source = implode("\n", ['// Recorded by tests/Support/InertiaContracts.php — do not edit.', ...$lines])."\n";
        $path = self::directory().'/'.$directory.'/'.substr(sha1($source), 0, 12);

        self::ensureDirectory(dirname($path));
        File::put($path.'.ts', $source);
        File::put($path.'.json', self::json($meta));
    }

    /** Parallel test processes create the same directories: losing that race is fine. */
    private static function ensureDirectory(string $directory): void
    {
        if (! File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, recursive: true, force: true);
        }
    }

    /**
     * The page object exactly as the browser receives it, decoded with objects kept as objects
     * so that `{}` and `[]` stay distinguishable.
     */
    private static function page(Response $response): ?object
    {
        $json = match (true) {
            $response->headers->get(Header::INERTIA) === 'true' => $response->getContent(),
            property_exists($response, 'original') && $response->original instanceof View => self::viewPage($response->original),
            default => null,
        };

        $page = is_string($json) ? json_decode($json, false) : null;

        return is_object($page) ? $page : null;
    }

    private static function viewPage(View $view): ?string
    {
        $page = $view->getData()['page'] ?? null;
        $json = is_array($page) ? json_encode($page) : false;

        return $json === false ? null : $json;
    }

    /**
     * @return list<string>
     */
    private static function headerList(Request $request, string $header): array
    {
        $value = $request->header($header);

        return is_string($value) && $value !== '' ? array_values(array_filter(explode(',', $value), fn (string $key): bool => $key !== '')) : [];
    }

    /**
     * @param  list<string>  $keys
     */
    private static function hasNestedKeys(array $keys): bool
    {
        return array_filter($keys, fn (string $key): bool => str_contains($key, '.')) !== [];
    }

    private static function json(mixed $value): string
    {
        return json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    private static function quote(string $value): string
    {
        return "'".str_replace("'", "\\'", $value)."'";
    }
}
