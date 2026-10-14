<?php

namespace App\Http\Controllers;

use App\Data\Notifications\NotificationData;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Notifications\IndexPage;
use App\Support\Inertia\Flash;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Spatie\LaravelData\PaginatedDataCollection;

/**
 * Notifications belong to the user, not to the workspace in the URL: the page lists all of them
 * (each payload carries the workspace it links into).
 */
final class NotificationController extends Controller
{
    public function index(Workspace $workspace, #[CurrentUser] User $user): IndexPage
    {
        $notifications = $user->notifications()
            ->reorder()
            ->orderByRaw('read_at is not null')
            ->latest()
            ->paginate(20);

        return new IndexPage(
            notifications: NotificationData::collect($notifications, PaginatedDataCollection::class),
        );
    }

    public function readAll(Workspace $workspace, #[CurrentUser] User $user): RedirectResponse
    {
        $user->unreadNotifications()->update(['read_at' => now()]);

        Flash::success('All notifications marked as read.');

        return back();
    }

    /**
     * `$notification` is deliberately not type-hinted as DatabaseNotification: the route sits in a
     * `withoutScopedBindings()` group nested in the workspace's `scopeBindings()` group, and Laravel
     * merges those flags with array_merge_recursive (→ [true, false], truthy), so implicit binding
     * would call Workspace::notifications(). Resolving through the user is the scoping we want anyway.
     */
    public function read(Workspace $workspace, string $notification, #[CurrentUser] User $user): RedirectResponse
    {
        $user->notifications()->findOrFail($notification)->markAsRead();

        return back();
    }
}
