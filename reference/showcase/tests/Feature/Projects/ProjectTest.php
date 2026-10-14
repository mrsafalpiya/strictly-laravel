<?php

use App\Enums\Color;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

/** Adds a member with the given role to the workspace. */
function projectMember(Workspace $workspace, WorkspaceRole $role): User
{
    $user = User::factory()->create();
    $workspace->members()->attach($user->id, ['role' => $role]);

    return $user;
}

test('projects index shows cards with per-status open issue counts', function () {
    [$workspace, $user, $project] = workspaceWith();
    $project->update(['name' => 'Tracklane', 'lead_id' => $user->id, 'color' => Color::Teal]);
    Issue::factory(2)->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::InReview]);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Done]);
    Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'EMPTY', 'name' => 'Empty project']);
    Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'OLD', 'archived_at' => now()]);

    $this->actingAs($user)
        ->get(route('projects.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->where('showArchived', false)
            ->where('archivedCount', 1)
            ->has('projects', 2)
            ->where('projects.0.key', 'EMPTY')
            // An empty map would serialise as [] instead of {}: every open status is always sent.
            ->where('projects.0.openIssueCounts', ['backlog' => 0, 'todo' => 0, 'in_progress' => 0, 'in_review' => 0])
            ->where('projects.1.key', 'TRK')
            ->where('projects.1.color', 'teal')
            ->where('projects.1.lead.id', $user->id)
            ->where('projects.1.issuesCount', 4)
            ->where('projects.1.openIssueCounts', ['backlog' => 0, 'todo' => 2, 'in_progress' => 0, 'in_review' => 1]));
});

test('archived projects are listed on request, after active ones', function () {
    [$workspace, $user] = workspaceWith();
    Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'AAA', 'archived_at' => now()]);

    $this->actingAs($user)
        ->get(route('projects.index', [$workspace, 'archived' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('showArchived', true)
            ->has('projects', 2)
            ->where('projects.0.key', 'TRK')
            ->where('projects.0.archivedAt', null)
            ->where('projects.1.key', 'AAA')
            ->whereType('projects.1.archivedAt', 'string'));
});

test('guests can view projects but not open the create or edit pages', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = projectMember($workspace, WorkspaceRole::Guest);

    $this->actingAs($guest)->get(route('projects.index', $workspace))->assertOk();
    $this->actingAs($guest)->get(route('projects.create', $workspace))->assertForbidden();
    $this->actingAs($guest)->get(route('projects.edit', [$workspace, $project]))->assertForbidden();
});

test('members without the manage role cannot write projects', function () {
    [$workspace, , $project] = workspaceWith();
    $member = projectMember($workspace, WorkspaceRole::Member);

    $this->actingAs($member)
        ->post(route('projects.store', $workspace), ['key' => 'NEW', 'name' => 'New', 'description' => null, 'color' => 'red', 'leadId' => null])
        ->assertForbidden();
    $this->actingAs($member)
        ->patch(route('projects.update', [$workspace, $project]), ['name' => 'X', 'description' => null, 'color' => 'red', 'leadId' => null])
        ->assertForbidden();
    $this->actingAs($member)->post(route('projects.archive', [$workspace, $project]))->assertForbidden();
    $this->actingAs($member)->delete(route('projects.destroy', [$workspace, $project]))->assertForbidden();
});

test('a project can be created from typed defaults', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('projects.create', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/create')
            ->where('defaults', ['key' => '', 'name' => '', 'description' => null, 'color' => 'blue', 'leadId' => null])
            ->has('options.members', 1));

    $this->actingAs($user)
        ->post(route('projects.store', $workspace), [
            'key' => 'WEB',
            'name' => 'Website',
            'description' => 'Marketing site',
            'color' => 'violet',
            'leadId' => $user->id,
        ])
        ->assertRedirect(route('projects.index', $workspace))
        ->assertInertiaFlash('toast.type', 'success');

    $project = $workspace->projects()->where('key', 'WEB')->sole();
    expect($project->name)->toBe('Website')
        ->and($project->color)->toBe(Color::Violet)
        ->and($project->lead_id)->toBe($user->id);
});

test('project keys are 2-10 uppercase letters, unique per workspace', function (string $key) {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->post(route('projects.store', $workspace), ['key' => $key, 'name' => 'X', 'description' => null, 'color' => 'red', 'leadId' => null])
        ->assertSessionHasErrors('key');
})->with(['lowercase' => 'web', 'too short' => 'W', 'too long' => 'ABCDEFGHIJK', 'digits' => 'AB1', 'taken' => 'TRK']);

test('the same key can be used in another workspace', function () {
    [$workspace, $user] = workspaceWith();
    workspaceWith(); // another workspace that also has a TRK project

    Project::query()->where('workspace_id', $workspace->id)->delete();

    $this->actingAs($user)
        ->post(route('projects.store', $workspace), ['key' => 'TRK', 'name' => 'X', 'description' => null, 'color' => 'red', 'leadId' => null])
        ->assertSessionHasNoErrors();
});

test('the lead must be a member of the workspace', function () {
    [$workspace, $user] = workspaceWith();
    $stranger = User::factory()->create();

    $this->actingAs($user)
        ->post(route('projects.store', $workspace), ['key' => 'NEW', 'name' => 'X', 'description' => null, 'color' => 'red', 'leadId' => $stranger->id])
        ->assertSessionHasErrors('leadId');
});

test('a project can be edited but its key is immutable', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Backlog]);

    $this->actingAs($user)
        ->get(route('projects.edit', [$workspace, $project]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/edit')
            ->where('project.key', 'TRK')
            ->where('project.openIssueCounts.backlog', 1)
            ->where('defaults.name', $project->name)
            ->missing('defaults.key'));

    // `key` is not part of UpdateProjectData, so it can't be changed: extra fields are ignored.
    $this->actingAs($user)
        ->patch(route('projects.update', [$workspace, $project]), ['key' => 'NEW', 'name' => 'Renamed', 'description' => null, 'color' => 'green', 'leadId' => $user->id])
        ->assertRedirect(route('projects.index', $workspace));

    $project->refresh();
    expect($project->key)->toBe('TRK')
        ->and($project->name)->toBe('Renamed')
        ->and($project->color)->toBe(Color::Green)
        ->and($project->lead_id)->toBe($user->id);
});

test('archive toggles the archived state', function () {
    [$workspace, $user, $project] = workspaceWith();

    $this->actingAs($user)->post(route('projects.archive', [$workspace, $project]))->assertRedirect();
    expect($project->refresh()->archived_at)->not->toBeNull();

    $this->actingAs($user)->post(route('projects.archive', [$workspace, $project]))->assertRedirect();
    expect($project->refresh()->archived_at)->toBeNull();
});

test('only projects without issues can be deleted', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory()->create(['project_id' => $project->id]);

    // Not a field error (the delete has no payload): reported as an error toast.
    $this->actingAs($user)
        ->from(route('projects.index', $workspace))
        ->delete(route('projects.destroy', [$workspace, $project]))
        ->assertRedirect(route('projects.index', $workspace))
        ->assertInertiaFlash('toast.type', 'error');

    expect($project->exists())->toBeTrue();

    $empty = Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'EMPTY']);

    $this->actingAs($user)
        ->delete(route('projects.destroy', [$workspace, $empty]))
        ->assertRedirect(route('projects.index', $workspace));

    expect(Project::query()->whereKey($empty->id)->exists())->toBeFalse();
});

test('projects of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    Project::query()->where('workspace_id', $workspace->id)->delete();
    workspaceWith(); // owns a TRK project

    $this->actingAs($user)->get(route('projects.edit', [$workspace, 'TRK']))->assertNotFound();
});
