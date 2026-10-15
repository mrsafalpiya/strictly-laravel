<?php

use App\Enums\WorkspaceRole;
use App\Models\Invitation;
use App\Models\Membership;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $attributes
 */
function joinAs(Workspace $workspace, WorkspaceRole $role, array $attributes = []): Membership
{
    $user = User::factory()->create($attributes);

    return Membership::query()->create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => $role]);
}

function membershipOf(Workspace $workspace, User $user): Membership
{
    return Membership::query()->where('workspace_id', $workspace->id)->where('user_id', $user->id)->sole();
}

test('managers see members with per-row abilities and pending invitations', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    $member = joinAs($workspace, WorkspaceRole::Member, ['name' => 'Zed']);
    Invitation::factory()->create(['workspace_id' => $workspace->id, 'invited_by_id' => $owner->id, 'email' => 'new@example.com']);
    Invitation::factory()->create(['workspace_id' => $workspace->id, 'invited_by_id' => $owner->id, 'accepted_at' => now()]);

    $this->actingAs($owner)
        ->get(route('members.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('members/index')
            ->has('members', 2)
            ->where('members.0.isViewer', true)
            ->where('members.0.role', 'owner')
            ->where('members.0.can', ['updateRole' => false, 'remove' => false])
            ->where('members.1.id', $member->id)
            ->where('members.1.user.name', 'Zed')
            ->where('members.1.can', ['updateRole' => true, 'remove' => true])
            ->has('invitations', 1)
            ->where('invitations.0.email', 'new@example.com')
            ->where('invitations.0.expired', false)
            ->where('inviteDefaults', ['email' => '', 'role' => 'member'])
            ->where('can.invite', true)
            ->where('can.assignableRoles', ['owner', 'admin', 'member']));
});

test('guests see a read-only list without invitations', function () {
    [$workspace] = workspaceWith(WorkspaceRole::Owner);
    $guest = joinAs($workspace, WorkspaceRole::Guest);
    Invitation::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($guest->user)
        ->get(route('members.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('members/index')
            ->has('members', 2)
            ->where('members.0.can.updateRole', false)
            ->where('members.1.can.remove', false)
            ->where('invitations', null)
            ->where('can', ['invite' => false, 'assignableRoles' => []]));
});

test('members and guests cannot change roles or remove anyone', function (WorkspaceRole $role) {
    [$workspace] = workspaceWith(WorkspaceRole::Owner);
    $actor = joinAs($workspace, $role);
    $other = joinAs($workspace, WorkspaceRole::Member);

    $this->actingAs($actor->user)->patch(route('members.update', [$workspace, $other]), ['role' => 'admin'])->assertForbidden();
    $this->actingAs($actor->user)->delete(route('members.destroy', [$workspace, $other]))->assertForbidden();

    expect($other->fresh()?->role)->toBe(WorkspaceRole::Member);
})->with([WorkspaceRole::Member, WorkspaceRole::Guest]);

test('admins change roles of non-owners', function () {
    [$workspace, $admin] = workspaceWith(WorkspaceRole::Admin);
    $member = joinAs($workspace, WorkspaceRole::Member);

    $this->actingAs($admin)
        ->patch(route('members.update', [$workspace, $member]), ['role' => 'admin'])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->fresh()?->role)->toBe(WorkspaceRole::Admin);
});

test('admins cannot grant ownership or touch owners', function () {
    [$workspace, $admin] = workspaceWith(WorkspaceRole::Admin);
    $member = joinAs($workspace, WorkspaceRole::Member);
    $owner = joinAs($workspace, WorkspaceRole::Owner);

    $this->actingAs($admin)
        ->patch(route('members.update', [$workspace, $member]), ['role' => 'owner'])
        ->assertSessionHasErrors(['role' => 'You cannot assign this role.']);

    $this->actingAs($admin)->patch(route('members.update', [$workspace, $owner]), ['role' => 'member'])->assertForbidden();
    $this->actingAs($admin)->delete(route('members.destroy', [$workspace, $owner]))->assertForbidden();

    expect($member->fresh()?->role)->toBe(WorkspaceRole::Member)
        ->and($owner->fresh()?->role)->toBe(WorkspaceRole::Owner);
});

test('nobody changes their own role and the last owner stays', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    $self = membershipOf($workspace, $owner);

    $this->actingAs($owner)->patch(route('members.update', [$workspace, $self]), ['role' => 'admin'])->assertForbidden();
    $this->actingAs($owner)->delete(route('members.destroy', [$workspace, $self]))->assertForbidden();

    expect($self->fresh()?->role)->toBe(WorkspaceRole::Owner);
});

test('an owner can demote another owner while one remains', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    $second = joinAs($workspace, WorkspaceRole::Owner);

    $this->actingAs($owner)
        ->patch(route('members.update', [$workspace, $second]), ['role' => 'member'])
        ->assertSessionHasNoErrors();

    expect($second->fresh()?->role)->toBe(WorkspaceRole::Member);
});

test('guest roles need allowGuests', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    $member = joinAs($workspace, WorkspaceRole::Member);

    $this->actingAs($owner)
        ->patch(route('members.update', [$workspace, $member]), ['role' => 'guest'])
        ->assertSessionHasErrors('role');

    $workspace->settings->allowGuests = true;
    $workspace->save();

    $this->actingAs($owner)
        ->patch(route('members.update', [$workspace, $member]), ['role' => 'guest'])
        ->assertSessionHasNoErrors();

    expect($member->fresh()?->role)->toBe(WorkspaceRole::Guest);
});

test('managers remove members, which clears their current workspace', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    $member = joinAs($workspace, WorkspaceRole::Member);
    $member->user->forceFill(['current_workspace_id' => $workspace->id])->save();

    $this->actingAs($owner)
        ->delete(route('members.destroy', [$workspace, $member]))
        ->assertRedirect()
        ->assertInertiaFlash('toast.type', 'success');

    expect($member->fresh())->toBeNull()
        ->and($member->user->fresh()?->current_workspace_id)->toBeNull();
});

test('memberships of another workspace are not reachable', function () {
    [$workspace, $owner] = workspaceWith(WorkspaceRole::Owner);
    [$other] = workspaceWith(WorkspaceRole::Owner);
    $foreign = joinAs($other, WorkspaceRole::Member);

    $this->actingAs($owner)->delete(route('members.destroy', [$workspace, $foreign]))->assertNotFound();

    expect($foreign->fresh())->not->toBeNull();
});
