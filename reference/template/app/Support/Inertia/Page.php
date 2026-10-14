<?php

namespace App\Support\Inertia;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use LogicException;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Hidden;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * The props of exactly one Inertia page.
 *
 * The page component is derived from the class name and mirrors resources/js/pages:
 *
 *     App\Pages\Settings\ProfilePage  →  'settings/profile'  →  resources/js/pages/settings/profile.tsx
 *
 * Controllers return the page object (it is Responsable):
 *
 *     return new ProfilePage(mustVerifyEmail: true, status: null);
 *
 * and the React component receives exactly those props, typed:
 *
 *     export default function Profile({ mustVerifyEmail, status }: PageProps<'settings/profile'>) {}
 *
 * The TypeScript types are generated from the constructor by `php artisan typescript:transform`
 * (run automatically by Vite while `composer dev` is running).
 */
#[Hidden]
abstract class Page extends Data
{
    public const string NAMESPACE = 'App\\Pages\\';

    public const string SUFFIX = 'Page';

    /** @var array<class-string, string> */
    private static array $components = [];

    /**
     * The Inertia component name, e.g. "settings/profile".
     */
    public static function component(): string
    {
        return self::componentFor(static::class);
    }

    /**
     * @param  class-string  $class
     */
    public static function componentFor(string $class): string
    {
        return self::$components[$class] ??= self::resolveComponent($class);
    }

    /**
     * The generated TypeScript type name, e.g. "SettingsProfilePage".
     *
     * @param  class-string  $class
     */
    public static function typeScriptNameFor(string $class): string
    {
        return Str::of(self::componentFor($class))
            ->explode('/')
            ->map(fn (string $segment): string => Str::studly($segment))
            ->implode('').self::SUFFIX;
    }

    public function render(): Response
    {
        return Inertia::render(static::component(), $this);
    }

    /**
     * @param  Request  $request
     */
    public function toResponse($request): SymfonyResponse
    {
        return $this->render()->toResponse($request);
    }

    /**
     * @param  class-string  $class
     */
    private static function resolveComponent(string $class): string
    {
        if (! str_starts_with($class, self::NAMESPACE) || ! str_ends_with($class, self::SUFFIX)) {
            throw new LogicException(sprintf(
                'Page classes must live in the %s namespace and end with "%s", got [%s].',
                self::NAMESPACE, self::SUFFIX, $class,
            ));
        }

        return Str::of($class)
            ->after(self::NAMESPACE)
            ->beforeLast(self::SUFFIX)
            ->explode('\\')
            ->map(fn (string $segment): string => Str::kebab($segment))
            ->implode('/');
    }
}
