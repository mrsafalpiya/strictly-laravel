<?php

use App\Enums\ActivityType;
use App\Enums\WorkspaceRole;
use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Membership;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Log\Events\MessageLogged;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $attributes
 */
function invitationFor(Workspace $workspace, User $inviter, array $attributes = []): Invitation
{
    return Invitation::factory()->create([
        'workspace_id' => $workspace->id,
        'invited_by_id' => $inviter->id,
        'email' => 'invitee@example.com',
        'role' => WorkspaceRole::Member,
        ...$attributes,
    ]);
}

test('managers invite by email and the accept link is logged', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Admin);
    Event::fake([MessageLogged::class]);

    $this->actingAs($owner)
        ->post(route('invitations.store', $workspace), ['email' => 'New@Example.com', 'role' => 'admin'])
        ->assertRedirect()
        ->assertSessionHasNoErrors()
        ->assertInertiaFlash('toast.message', 'Invited new@example.com.');

    $invitation = Invitation::query()->sole();
    expect($invitation->email)->toBe('new@example.com')
        ->and($invitation->role)->toBe(WorkspaceRole::Admin)
        ->and($invitation->expires_at->isFuture())->toBeTrue();

    Event::assertDispatched(
        MessageLogged::class,
        fn (MessageLogged $log): bool => ($log->context['url'] ?? null) === route('invitations.show', $invitation->token),
    );
});

test('invitations reject members, duplicates and unassignable roles', function () {
    [$workspace, $admin] = workspaceWith(WorkspaceRole::Admin);
    invitationFor($workspace, $admin, ['email' => 'pending@example.com']);

    $this->actingAs($admin)
        ->post(route('invitations.store', $workspace), ['email' => strtoupper($admin->email), 'role' => 'member'])
        ->assertSessionHasErrors(['email' => 'This person is already a member.']);

    $this->actingAs($admin)
        ->post(route('invitations.store', $workspace), ['email' => 'pending@example.com', 'role' => 'member'])
        ->assertSessionHasErrors(['email' => 'This person already has a pending invitation.']);

    $this->actingAs($admin)
        ->post(route('invitations.store', $workspace), ['email' => 'not-an-email', 'role' => 'owner'])
        ->assertSessionHasErrors(['email', 'role']);

    $this->actingAs($admin)
        ->post(route('invitations.store', $workspace), ['email' => 'guest@example.com', 'role' => 'guest'])
        ->assertSessionHasErrors(['role' => 'You cannot invite people with this role.']);

    expect(Invitation::query()->count())->toBe(1);
});

test('an expired invitation can be replaced by a new one', function () {
    [$workspace, $owner] = workspaceWith();
    $old = invitationFor($workspace, $owner, ['expires_at' => now()->subDay()]);

    $this->actingAs($owner)
        ->post(route('invitations.store', $workspace), ['email' => 'invitee@example.com', 'role' => 'member'])
        ->assertSessionHasNoErrors();

    expect($old->fresh())->toBeNull()
        ->and(Invitation::query()->sole()->isExpired())->toBeFalse();
});

test('non-managers cannot invite or revoke, and get no validation hints', function (WorkspaceRole $role) {
    [$workspace, $user] = workspaceWith($role);
    $invitation = invitationFor($workspace, $user);

    $this->actingAs($user)->post(route('invitations.store', $workspace), ['email' => 'invitee@example.com', 'role' => 'member'])->assertForbidden();
    $this->actingAs($user)->delete(route('invitations.destroy', [$workspace, $invitation]))->assertForbidden();

    expect($invitation->fresh())->not->toBeNull();
})->with([WorkspaceRole::Member, WorkspaceRole::Guest]);

test('managers revoke invitations of their own workspace only', function () {
    [$workspace, $owner] = workspaceWith();
    [$other, $otherOwner] = workspaceWith();
    $mine = invitationFor($workspace, $owner);
    $foreign = invitationFor($other, $otherOwner);

    $this->actingAs($owner)->delete(route('invitations.destroy', [$workspace, $foreign]))->assertNotFound();
    $this->actingAs($owner)->delete(route('invitations.destroy', [$workspace, $mine]))->assertRedirect();

    expect($mine->fresh())->toBeNull()->and($foreign->fresh())->not->toBeNull();
});

test('the invitee sees a pending invitation and accepts it', function () {
    [$workspace, $owner] = workspaceWith();
    $invitation = invitationFor($workspace, $owner, ['role' => WorkspaceRole::Admin]);
    $invitee = User::factory()->create(['email' => 'Invitee@example.com']);

    $this->actingAs($invitee)
        ->get(route('invitations.show', $invitation->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('invitations/show')
            ->where('invitation.workspaceName', $workspace->name)
            ->where('invitation.invitedBy.name', $owner->name)
            ->where('invitation.role', 'admin')
            ->where('invitation.status', 'pending')
            ->where('workspace', null));

    $this->actingAs($invitee)
        ->post(route('invitations.accept', $invitation->token))
        ->assertRedirect(route('workspace.dashboard', $workspace))
        ->assertInertiaFlash('toast.message', "Welcome to {$workspace->name}.");

    $activity = Activity::query()->sole();
    expect($invitee->fresh()?->roleIn($workspace))->toBe(WorkspaceRole::Admin)
        ->and($invitation->fresh()?->accepted_at)->not->toBeNull()
        ->and($invitee->fresh()?->current_workspace_id)->toBe($workspace->id)
        ->and($activity->type)->toBe(ActivityType::MemberJoined)
        ->and($activity->issue_id)->toBeNull()
        ->and($activity->payload)->toBe(['role' => 'admin', 'type' => 'member_joined']);
});

test('unusable invitations are shown with their status and rejected', function (string $status) {
    [$workspace, $owner] = workspaceWith();
    $invitee = User::factory()->create(['email' => 'invitee@example.com']);

    if ($status === 'already_member') {
        $workspace->members()->attach($invitee->id, ['role' => WorkspaceRole::Member]);
    }

    $invitation = invitationFor($workspace, $owner, match ($status) {
        'expired' => ['expires_at' => now()->subMinute()],
        'accepted' => ['accepted_at' => now()],
        default => [],
    });
    $viewer = $status === 'wrong_email' ? User::factory()->create() : $invitee;

    $this->actingAs($viewer)
        ->get(route('invitations.show', $invitation->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('invitations/show')->where('invitation.status', $status));

    $this->actingAs($viewer)
        ->post(route('invitations.accept', $invitation->token))
        ->assertRedirect($status === 'already_member' ? route('workspace.dashboard', $workspace) : route('invitations.show', $invitation->token));

    expect(Membership::query()->where('workspace_id', $workspace->id)->count())->toBe($status === 'already_member' ? 2 : 1)
        ->and(Activity::query()->count())->toBe(0);
})->with(['expired', 'accepted', 'wrong_email', 'already_member']);

test('rejections explain themselves in a flash toast', function () {
    [$workspace, $owner] = workspaceWith();
    $invitation = invitationFor($workspace, $owner, ['expires_at' => now()->subMinute()]);

    $response = $this->actingAs(User::factory()->create(['email' => 'invitee@example.com']))
        ->post(route('invitations.accept', $invitation->token));

    $response->assertInertiaFlash('toast.type', 'error');
    $response->assertInertiaFlash('toast.message', 'This invitation has expired. Ask for a new one.');
});

test('unknown tokens are a 404', function () {
    $this->actingAs(User::factory()->create())->get(route('invitations.show', 'nope'))->assertNotFound();
});

test('guests must log in before seeing an invitation', function () {
    $this->get(route('invitations.show', 'nope'))->assertRedirect(route('login'));
});
