<?php

namespace App\Http\Middleware;

use App\Data\AuthData;
use App\Data\SharedProps;
use App\Data\UserData;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * Typed by App\Data\SharedProps: add a property there to share something new.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $shared = new SharedProps(
            name: config()->string('app.name'),
            auth: new AuthData(user: $user instanceof User ? UserData::fromModel($user) : null),
            sidebarOpen: ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        );

        /** @var array<string, mixed> $props Data objects always transform to string-keyed arrays. */
        $props = $shared->toArray();

        return [
            ...parent::share($request),
            ...$props,
        ];
    }
}
