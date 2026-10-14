<?php

namespace App\Http\Middleware;

use App\Data\AuthData;
use App\Data\SharedProps;
use App\Data\UserData;
use App\Data\Workspaces\CurrentWorkspaceData;
use App\Data\Workspaces\WorkspaceSummaryData;
use App\Models\Membership;
use App\Models\User;
use App\Models\Workspace;
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

        $user = $user instanceof User ? $user : null;
        $workspace = $request->route('workspace');
        $role = $user !== null && $workspace instanceof Workspace ? $user->roleIn($workspace) : null;

        $shared = new SharedProps(
            name: config()->string('app.name'),
            auth: new AuthData(user: $user !== null ? UserData::fromModel($user) : null),
            sidebarOpen: ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            workspace: $workspace instanceof Workspace && $role !== null ? CurrentWorkspaceData::fromModel($workspace, $role) : null,
            workspaces: $user === null ? [] : $user->memberships()->with('workspace')->get()
                ->sortBy(fn (Membership $membership): string => $membership->workspace->name)
                ->map(fn (Membership $membership): WorkspaceSummaryData => WorkspaceSummaryData::fromModel($membership->workspace, $membership->role))
                ->values()
                ->all(),
            unreadNotifications: $user?->unreadNotifications()->count() ?? 0,
        );

        /** @var array<string, mixed> $props Data objects always transform to string-keyed arrays. */
        $props = $shared->toArray();

        return [
            ...parent::share($request),
            ...$props,
        ];
    }
}
