<?php

use App\Data\Notifications\CommentAddedNotificationPayload;
use App\Data\Notifications\IssueAssignedNotificationPayload;
use App\Data\Notifications\NotificationData;
use App\Enums\WorkspaceRole;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\IssueAssigned;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Collaboration\Members;

/**
 * What assigning an issue sends its new assignee. (The Issues area sends it when an issue's assignee changes.)
 */
function notifyAssigned(Workspace $workspace, Issue $issue, User $by, User $assignee): void
{
    $issue->loadMissing('project');
    $assignee->notify(new IssueAssigned(IssueAssignedNotificationPayload::fromModels($workspace, $issue, $by)));
}

test('stored payloads round-trip into the discriminated union', function () {
    [$workspace, $user, $project] = workspaceWith();
    $assignee = Members::add($workspace);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'reporter_id' => $assignee->id]);

    notifyAssigned($workspace, $issue, $user, $assignee);
    $this->actingAs($user)->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Please take a look']);

    $payloads = $assignee->notifications()->get()->map(fn (DatabaseNotification $notification): object => NotificationData::fromModel($notification)->payload);

    expect($payloads->map(fn (object $payload): string => $payload::class)->all())
        ->toEqualCanonicalizing([IssueAssignedNotificationPayload::class, CommentAddedNotificationPayload::class]);
});

test('the notifications page lists unread first and is shared as an unread count', function () {
    [$workspace, $user, $project] = workspaceWith();
    $recipient = Members::add($workspace);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'reporter_id' => $recipient->id]);

    notifyAssigned($workspace, $issue, $user, $recipient);
    $this->travel(1)->minutes();
    $this->actingAs($user)->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'First']);
    $this->travel(1)->minutes();
    $this->actingAs($user)->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Second']);
    // The newest one has been read: it must sort after the older unread ones.
    $recipient->notifications()->latest()->firstOrFail()->markAsRead();

    $this->actingAs($recipient)
        ->get(route('notifications.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->where('unreadNotifications', 2)
            ->has('notifications.data', 3)
            ->where('notifications.data.0.payload.type', 'comment_added')
            ->where('notifications.data.0.payload.excerpt', 'First')
            ->where('notifications.data.0.readAt', null)
            ->where('notifications.data.1.payload.type', 'issue_assigned')
            ->where('notifications.data.1.payload.issue.identifier', 'TRK-1')
            ->where('notifications.data.1.payload.assignedBy.id', $user->id)
            ->where('notifications.data.2.payload.excerpt', 'Second')
            ->whereNot('notifications.data.2.readAt', null));
});

test('a notification can be marked as read only by its owner', function () {
    [$workspace, $user, $project] = workspaceWith();
    $recipient = Members::add($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    notifyAssigned($workspace, $issue, $user, $recipient);
    $notification = $recipient->notifications()->sole();

    $this->actingAs($user)
        ->patch(route('notifications.read', [$workspace, $notification->id]))
        ->assertNotFound();
    expect($notification->fresh()?->read_at)->toBeNull();

    $this->actingAs($recipient)
        ->patch(route('notifications.read', [$workspace, $notification->id]))
        ->assertRedirect();
    expect($notification->fresh()?->read_at)->not->toBeNull();
});

test('all notifications can be marked as read', function () {
    [$workspace, $user, $project] = workspaceWith();
    $recipient = Members::add($workspace);
    foreach (Issue::factory(3)->create(['project_id' => $project->id]) as $issue) {
        notifyAssigned($workspace, $issue, $user, $recipient);
    }
    $issue = Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $user->id]);
    $this->actingAs($recipient)->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Mine stays unread']);

    $this->actingAs($recipient)
        ->post(route('notifications.read-all', $workspace))
        ->assertRedirect()
        ->assertInertiaFlash('toast.message', 'All notifications marked as read.');

    expect($recipient->unreadNotifications()->count())->toBe(0)
        ->and($user->unreadNotifications()->count())->toBe(1);

    $this->actingAs($recipient)
        ->get(route('notifications.index', $workspace))
        ->assertInertia(fn (Assert $page) => $page->where('unreadNotifications', 0)->has('notifications.data', 3));
});

test('the notifications page is paginated', function () {
    [$workspace, $user, $project] = workspaceWith();
    $recipient = Members::add($workspace);
    foreach (Issue::factory(25)->create(['project_id' => $project->id]) as $issue) {
        notifyAssigned($workspace, $issue, $user, $recipient);
    }

    $this->actingAs($recipient)
        ->get(route('notifications.index', [$workspace, 'page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 5)
            ->where('notifications.meta.total', 25)
            ->where('notifications.meta.current_page', 2));
});

test('a user without notifications is all caught up', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('notifications.index', $workspace))
        ->assertInertia(fn (Assert $page) => $page
            ->where('unreadNotifications', 0)
            ->where('notifications.data', []));
});
