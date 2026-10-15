<?php

use App\Enums\IssueView;
use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

test('the create page sends empty typed defaults', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('workspaces.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('workspaces/create')
            ->where('defaults', ['name' => '', 'slug' => ''])
            ->where('workspace', null));
});

test('creating a workspace makes the creator its owner', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('workspaces.store'), ['name' => 'Acme Labs', 'slug' => 'acme-labs'])
        ->assertRedirect(route('workspace.dashboard', 'acme-labs'))
        ->assertInertiaFlash('toast.message', 'Created Acme Labs.');

    $workspace = Workspace::query()->where('slug', 'acme-labs')->sole();

    expect($workspace->owner_id)->toBe($user->id)
        ->and($user->roleIn($workspace))->toBe(WorkspaceRole::Owner)
        ->and($workspace->settings->defaultView)->toBe(IssueView::List)
        ->and($workspace->settings->weekStartsOn)->toBe('monday')
        ->and($user->fresh()?->current_workspace_id)->toBe($workspace->id);
});

test('workspace slugs must be well formed and unique', function (string $slug) {
    Workspace::factory()->create(['slug' => 'taken']);

    $this->actingAs(User::factory()->create())
        ->post(route('workspaces.store'), ['name' => 'Acme', 'slug' => $slug])
        ->assertSessionHasErrors('slug');

    expect(Workspace::query()->count())->toBe(1);
})->with(['taken', 'Upper-Case', 'trailing-', 'double--dash', 'with space', 'a', '']);

test('guests are redirected to login', function () {
    $this->get(route('workspaces.create'))->assertRedirect(route('login'));
    $this->post(route('workspaces.store'), ['name' => 'Acme', 'slug' => 'acme'])->assertRedirect(route('login'));
});
