<?php

namespace Tests\Browser\Support;

use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Illuminate\Support\Collection;
use PHPUnit\Framework\Assert;
use StrictlyLaravel\Routes\RouteResponse;

/**
 * The routes the smoke test loads in the browser: every GET route of the `web` group, so a new page is visited without
 * touching the smoke test, except the JSON endpoints (an action returning a Data class, or a vendor action with a
 * declared response) and the routes in NOT_PAGES.
 */
final class PageRoutes
{
    /**
     * GET routes that aren't pages, by name (by URI when unnamed), and why the smoke test doesn't load them.
     */
    public const array NOT_PAGES = [
        '_inertia/devtools/entries' => "Inertia's dev tools",
        '_inertia/devtools/entries/{id}' => "Inertia's dev tools",
        'attachments.show' => 'a file download',
        'passkey.confirm-options' => 'JSON the passkey dialogs fetch',
        'passkey.login-options' => 'JSON the passkey dialogs fetch',
        'passkey.registration-options' => 'JSON the passkey dialogs fetch',
        'password.confirmation' => 'JSON the two-factor and passkey dialogs fetch',
        'settings' => 'a redirect to settings/profile, which is loaded itself',
        'verification.verify' => 'the signed link in the verification email',
        'well-known.passkeys' => 'JSON for password managers',
    ];

    /**
     * The routes a guest loads: those without the `auth` middleware.
     *
     * @return list<Route>
     */
    public static function forGuests(): array
    {
        return self::all()->reject(self::needsUser(...))->values()->all();
    }

    /**
     * The routes a user loads once logged in.
     *
     * @return list<Route>
     */
    public static function forUsers(): array
    {
        return self::all()->filter(self::needsUser(...))->values()->all();
    }

    /**
     * The route's URL, its parameters taken from the given values by name. Fails for a parameter without one, so a new
     * route parameter gets a value here rather than going unvisited.
     *
     * @param  array<string, mixed>  $values
     */
    public static function url(Route $route, array $values): string
    {
        $parameters = [];

        foreach ($route->parameterNames() as $name) {
            Assert::assertArrayHasKey($name, $values, "The smoke test has no value for {{$name}} in GET /{$route->uri()}: add one to the values it loads pages with.");
            $parameters[$name] = $values[$name];
        }

        return route((string) $route->getName(), $parameters, false);
    }

    /**
     * @return Collection<int, Route>
     */
    private static function all(): Collection
    {
        return collect(app(Router::class)->getRoutes()->getRoutes())
            ->filter(fn (Route $route): bool => in_array('GET', $route->methods(), true)
                && in_array('web', $route->gatherMiddleware(), true)
                && ! array_key_exists($route->getName() ?? $route->uri(), self::NOT_PAGES)
                && RouteResponse::ofRoute($route) === null)
            ->each(fn (Route $route) => Assert::assertNotNull($route->getName(), "GET /{$route->uri()} has no name: name it, or add it to PageRoutes::NOT_PAGES with the reason the smoke test skips it."))
            ->sortBy(fn (Route $route): string => $route->uri());
    }

    private static function needsUser(Route $route): bool
    {
        return collect($route->gatherMiddleware())
            ->contains(fn (mixed $middleware): bool => $middleware === 'auth' || (is_string($middleware) && str_starts_with($middleware, 'auth:')));
    }
}
