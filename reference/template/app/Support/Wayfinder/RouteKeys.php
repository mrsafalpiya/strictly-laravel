<?php

namespace App\Support\Wayfinder;

use App\Support\Data\InputData;
use App\Support\Data\RouteKeyOf;
use Illuminate\Contracts\Routing\UrlRoutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Router;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionProperty;

/**
 * Nominal route parameters. Wayfinder types `show({ project })` structurally (`string | { key: string }`), so any
 * string or any object with a `key` would do — an issue's key where a project's is expected type-checks.
 * Instead, a model's route key is branded with the model, on both sides:
 *
 *  - route parameters bound to a model (controller type-hint `Project $project`) take `RouteKey<'Project', string>`
 *    or `{ key: RouteKey<'Project', string> }` (template override, RouteTypes::parameterType);
 *  - a Data class built by `fromModel(Project $project)` has its route-key properties (every binding field the
 *    routes use for Project: `key`, …) typed `RouteKey<'Project', string>` (RouteKeysDataClassTransformer), and so
 *    does a property declaring `#[RouteKeyOf(Project::class)]` (another model's key, e.g. an issue's `projectKey`).
 *
 * So `show({ workspace, project })` only accepts a Project-derived value: a ProjectData, its `key`, or a declared
 * `projectKey`. The tests check every branded value a response sends is an existing key of its model
 * (tests/Support/RouteKeyChecks.php).
 */
final class RouteKeys
{
    /** @var array<class-string<Model>, list<string>>|null */
    private static ?array $byModel = null;

    /** @var array<string, array<string, array{model: class-string<Model>, field: string}>> */
    private static array $byDataClass = [];

    /**
     * The route keys of each model: the binding field of every route parameter bound to it (`{project:slug}` →
     * `slug`, `{project}` → its getRouteKeyName()), matched to the action's parameters as Wayfinder does.
     *
     * @return array<class-string<Model>, list<string>>
     */
    public static function byModel(): array
    {
        if (self::$byModel !== null) {
            return self::$byModel;
        }

        $keys = [];

        foreach (app(Router::class)->getRoutes()->getRoutes() as $route) {
            $signature = array_filter($route->signatureParameters(['subClass' => UrlRoutable::class]), fn (mixed $parameter): bool => $parameter instanceof ReflectionParameter);

            foreach (array_filter($route->parameterNames(), is_string(...)) as $name) {
                $model = self::boundModel(array_find($signature, fn (ReflectionParameter $parameter): bool => Str::snake($parameter->getName()) === Str::snake($name)));
                $field = $route->bindingFieldFor($name);

                if ($model !== null) {
                    $keys[$model][] = is_string($field) ? $field : (new $model)->getRouteKeyName();
                }
            }
        }

        return self::$byModel = array_map(fn (array $fields): array => array_values(array_unique($fields)), $keys);
    }

    /**
     * The model a route parameter is bound to (null for plain `{token}`-style parameters).
     *
     * @return class-string<Model>|null
     */
    public static function boundModel(?ReflectionParameter $parameter): ?string
    {
        $class = $parameter === null ? null : Reflector::getParameterClassName($parameter);

        return $class !== null && is_subclass_of($class, Model::class) ? $class : null;
    }

    /**
     * The properties of a Data class holding a route key (see forProperty()).
     *
     * @return array<string, array{model: class-string<Model>, field: string}>
     */
    public static function inDataClass(string $dataClass): array
    {
        if (isset(self::$byDataClass[$dataClass])) {
            return self::$byDataClass[$dataClass];
        }

        $keys = [];

        foreach (class_exists($dataClass) ? (new ReflectionClass($dataClass))->getProperties(ReflectionProperty::IS_PUBLIC) : [] as $property) {
            $key = $property->isStatic() ? null : self::forProperty($dataClass, $property->getName());

            if ($key !== null) {
                $keys[$property->getName()] = $key;
            }
        }

        return self::$byDataClass[$dataClass] = $keys;
    }

    /**
     * The model (and its column) whose route key a Data class property holds, if any: declared with
     * #[RouteKeyOf], or the property is one of the model's route keys and the class is built from that model
     * (`fromModel(Project $project)`). Inputs are never branded: they hold what the user typed.
     *
     * @return array{model: class-string<Model>, field: string}|null
     */
    public static function forProperty(string $dataClass, string $property): ?array
    {
        if (! class_exists($dataClass) || ! property_exists($dataClass, $property) || is_subclass_of($dataClass, InputData::class)) {
            return null;
        }

        $declared = (new ReflectionProperty($dataClass, $property))->getAttributes(RouteKeyOf::class)[0] ?? null;

        if ($declared !== null) {
            $attribute = $declared->newInstance();

            return ['model' => $attribute->model, 'field' => $attribute->field ?? (new $attribute->model)->getRouteKeyName()];
        }

        $model = self::modelOf($dataClass);

        return $model !== null && in_array($property, self::byModel()[$model] ?? [], true) ? ['model' => $model, 'field' => $property] : null;
    }

    /**
     * @return class-string<Model>|null
     */
    private static function modelOf(string $dataClass): ?string
    {
        if (! method_exists($dataClass, 'fromModel')) {
            return null;
        }

        $type = ((new ReflectionMethod($dataClass, 'fromModel'))->getParameters()[0] ?? null)?->getType();

        return $type instanceof ReflectionNamedType && is_subclass_of($type->getName(), Model::class) ? $type->getName() : null;
    }
}
