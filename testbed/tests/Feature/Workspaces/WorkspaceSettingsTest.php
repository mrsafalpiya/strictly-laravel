<?php

use App\Enums\IssueView;
use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * A valid PATCH body for the workspace's current state, with $overrides merged in recursively.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<array-key, mixed>
 */
function settingsPayload(Workspace $workspace, array $overrides = []): array
{
    return array_replace_recursive([
        'name' => $workspace->name,
        'slug' => $workspace->slug,
        'settings' => [
            'defaultView' => 'list',
            'weekStartsOn' => 'monday',
            'allowGuests' => false,
            'notifications' => ['onAssign' => true, 'onComment' => true, 'dailyDigest' => false],
        ],
    ], $overrides);
}

test('owners see the settings form with nested defaults', function () {
    [$workspace, $user] = workspaceWith(WorkspaceRole::Owner);

    $this->actingAs($user)
        ->get(route('workspace.settings.edit', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('workspaces/settings')
            ->where('defaults.slug', $workspace->slug)
            ->where('defaults.settings.defaultView', 'list')
            ->where('defaults.settings.notifications.onAssign', true)
            ->where('can', ['update' => true, 'delete' => true]));
});

test('admins can edit settings but not delete the workspace', function () {
    [$workspace, $user] = workspaceWith(WorkspaceRole::Admin);

    $this->actingAs($user)
        ->get(route('workspace.settings.edit', $workspace))
        ->assertInertia(fn (Assert $page) => $page->where('can.delete', false));

    $this->actingAs($user)
        ->delete(route('workspace.destroy', $workspace), ['confirmName' => $workspace->name])
        ->assertForbidden();

    expect($workspace->fresh())->not->toBeNull();
});

test('members and guests cannot open or change settings', function (WorkspaceRole $role) {
    [$workspace, $user] = workspaceWith($role);

    $this->actingAs($user)->get(route('workspace.settings.edit', $workspace))->assertForbidden();
    $this->actingAs($user)->patch(route('workspace.settings.update', $workspace), settingsPayload($workspace, ['name' => 'Hijacked']))->assertForbidden();

    expect($workspace->fresh()?->name)->not->toBe('Hijacked');
})->with([WorkspaceRole::Member, WorkspaceRole::Guest]);

test('settings are saved as one nested object', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->patch(route('workspace.settings.update', $workspace), settingsPayload($workspace, [
            'name' => 'Renamed',
            'slug' => 'renamed',
            'settings' => [
                'defaultView' => 'board',
                'weekStartsOn' => 'sunday',
                'allowGuests' => true,
                'notifications' => ['dailyDigest' => true],
            ],
        ]))
        ->assertRedirect(route('workspace.settings.edit', 'renamed'));

    $workspace->refresh();
    expect($workspace->name)->toBe('Renamed')
        ->and($workspace->slug)->toBe('renamed')
        ->and($workspace->settings->defaultView)->toBe(IssueView::Board)
        ->and($workspace->settings->weekStartsOn)->toBe('sunday')
        ->and($workspace->settings->allowGuests)->toBeTrue()
        ->and($workspace->settings->notifications->onAssign)->toBeTrue()
        ->and($workspace->settings->notifications->dailyDigest)->toBeTrue();
});

test('nested settings errors are keyed by their dotted path', function () {
    [$workspace, $user] = workspaceWith();
    Workspace::factory()->create(['slug' => 'taken']);

    $this->actingAs($user)
        ->patch(route('workspace.settings.update', $workspace), [
            'name' => '',
            'slug' => 'taken',
            'settings' => [
                'defaultView' => 'calendar',
                'weekStartsOn' => 'friday',
                'allowGuests' => 'maybe',
                'notifications' => ['onAssign' => 'yes', 'onComment' => true],
            ],
        ])
        ->assertSessionHasErrors([
            'name',
            'slug',
            'settings.defaultView',
            'settings.weekStartsOn',
            'settings.allowGuests',
            'settings.notifications.onAssign' => 'The assignment notifications field must be true or false.',
        ])
        // Properties with a PHP default are not `required`: a missing key silently becomes the default.
        ->assertSessionDoesntHaveErrors(['settings.notifications.onComment', 'settings.notifications.dailyDigest']);
});

test('updated slugs keep the slug format rules', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->patch(route('workspace.settings.update', $workspace), settingsPayload($workspace, ['slug' => 'Not A Slug']))
        ->assertSessionHasErrors(['slug' => 'Use lowercase letters, numbers and single dashes only.']);
});

test('keeping the current slug is not a uniqueness error', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->patch(route('workspace.settings.update', $workspace), settingsPayload($workspace))
        ->assertSessionHasNoErrors();
});

test('owners delete a workspace by typing its name', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->delete(route('workspace.destroy', $workspace), ['confirmName' => 'wrong'])
        ->assertSessionHasErrors('confirmName');

    expect($workspace->fresh())->not->toBeNull();

    $this->actingAs($user)
        ->delete(route('workspace.destroy', $workspace), ['confirmName' => $workspace->name])
        ->assertRedirect(route('dashboard'));

    expect($workspace->fresh())->toBeNull()
        ->and($user->fresh()?->current_workspace_id)->toBeNull();
});

test('non-members get a 404 for settings', function () {
    [$workspace] = workspaceWith();

    $this->actingAs(User::factory()->create())
        ->get(route('workspace.settings.edit', $workspace))
        ->assertNotFound();
});
