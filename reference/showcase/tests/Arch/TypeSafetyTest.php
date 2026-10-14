<?php

use App\Support\Data\InputData;
use App\Support\Inertia\Page;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;
use Symfony\Component\Finder\Finder;

/*
 * Guard rails that keep every byte sent to React described by a generated TypeScript type.
 */

arch('pages are rendered only through Page classes, never with untyped arrays')
    ->expect(['Inertia\Inertia', 'inertia'])
    ->toOnlyBeUsedIn(['App\Support\Inertia', 'App\Http\Middleware\HandleInertiaRequests']);

arch('page classes mirror resources/js/pages')
    ->expect('App\Pages')
    ->classes()
    ->toExtend(Page::class)
    ->toHaveSuffix('Page')
    ->toBeFinal();

arch('data objects are laravel-data classes')
    ->expect('App\Data')
    ->classes()
    ->toExtend(Data::class)
    ->toBeFinal();

arch('controllers do not leak models to the frontend')
    ->expect('App\Http\Controllers')
    ->not->toUse(['Illuminate\Http\Resources\Json\JsonResource', 'Illuminate\Http\Resources\Json\ResourceCollection']);

test('request payloads extend InputData', function () {
    // Every laravel-data parameter of a controller action is a request payload: InputData merges custom
    // rules with the inferred ones, and makes Wayfinder type the route's form and the recorded contracts.
    $offenders = [];

    foreach (app('router')->getRoutes()->getRoutes() as $route) {
        $controller = $route->getControllerClass();
        $method = $route->getActionMethod() === $controller ? '__invoke' : $route->getActionMethod();

        if ($controller === null || ! class_exists($controller) || ! method_exists($controller, $method)) {
            continue;
        }

        foreach ((new ReflectionMethod($controller, $method))->getParameters() as $parameter) {
            $type = $parameter->getType();
            $class = $type instanceof ReflectionNamedType ? $type->getName() : null;

            if ($class !== null && is_subclass_of($class, Data::class) && ! is_subclass_of($class, InputData::class)) {
                $offenders[] = "{$controller}@{$method}: {$class}";
            }
        }
    }

    expect(array_values(array_unique($offenders)))->toBe([], 'Controller Data parameters must extend App\\Support\\Data\\InputData');
});

test('data classes with rules() are request payloads', function () {
    $offenders = [];

    foreach (Finder::create()->files()->in(app_path('Data'))->name('*.php') as $file) {
        $class = 'App\\Data\\'.Str::of($file->getRelativePathname())->replace('/', '\\')->beforeLast('.php')->value();

        if (class_exists($class) && method_exists($class, 'rules') && ! is_subclass_of($class, InputData::class)) {
            $offenders[] = $class;
        }
    }

    expect($offenders)->toBe([], 'Data classes with rules() must extend App\\Support\\Data\\InputData');
});

test('every page component has a Page class', function () {
    $components = [];

    foreach (Finder::create()->files()->in(resource_path('js/pages'))->name('*.tsx') as $file) {
        $components[] = Str::of($file->getRelativePathname())->replace('\\', '/')->beforeLast('.tsx')->value();
    }

    $pages = [];

    foreach (Finder::create()->files()->in(app_path('Pages'))->name('*Page.php') as $file) {
        $class = Page::NAMESPACE.Str::of($file->getRelativePathname())->replace('/', '\\')->beforeLast('.php')->value();

        if (class_exists($class)) {
            $pages[] = Page::componentFor($class);
        }
    }

    expect(array_values(array_diff($components, $pages)))
        ->toBe([], 'These page components have no App\\Pages class (run `php artisan make:page <name>`)');
});
