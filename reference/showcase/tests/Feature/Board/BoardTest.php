<?php

use App\Enums\ActivityType;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Http\Controllers\BoardController;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Inertia\Testing\AssertableInertia as Assert;

test('the board has one column per status, in enum order, with a per-column cap', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory(BoardController::COLUMN_LIMIT + 3)->sequence(fn (Sequence $sequence) => ['number' => $sequence->index + 1, 'position' => $sequence->index])
        ->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Done, 'number' => 999, 'position' => 0]);

    $this->actingAs($user)
        ->get(route('board.show', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('board/show')
            ->has('columns', count(IssueStatus::cases()))
            ->where('columns.0.status', 'backlog')
            ->where('columns.0.issues', [])
            ->where('columns.0.total', 0)
            ->where('columns.1.status', 'todo')
            ->has('columns.1.issues', BoardController::COLUMN_LIMIT)
            ->where('columns.1.issues.0.identifier', 'TRK-1')
            ->where('columns.1.total', BoardController::COLUMN_LIMIT + 3)
            ->where('columns.1.hiddenCount', 3)
            ->where('columns.4.status', 'done')
            ->has('columns.4.issues', 1)
            ->where('projectKey', null)
            ->has('projects', 1)
            ->where('columnLimit', BoardController::COLUMN_LIMIT));
});

test('the board can be filtered by project', function () {
    [$workspace, $user, $project] = workspaceWith();
    $other = Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'OTH']);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);
    Issue::factory()->create(['project_id' => $other->id, 'status' => IssueStatus::Todo]);

    $this->actingAs($user)
        ->get(route('board.show', [$workspace, 'project' => 'OTH']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('projectKey', 'OTH')
            ->has('columns.1.issues', 1)
            ->where('columns.1.issues.0.project.key', 'OTH'));

    // An unknown key shows every project rather than failing.
    $this->actingAs($user)
        ->get(route('board.show', [$workspace, 'project' => 'NOPE']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('projectKey', null)
            ->has('columns.1.issues', 2));
});

test('moving an issue to another column changes its status, position and completion and records activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo, 'number' => 1]);
    $first = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Done, 'number' => 2, 'position' => 0]);
    $second = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Done, 'number' => 3, 'position' => 1]);

    $this->actingAs($user)
        ->from(route('board.show', $workspace))
        ->patch(route('board.move', [$workspace, $project, $issue]), ['status' => 'done', 'position' => 1, 'beforeId' => $second->id, 'afterId' => $first->id])
        ->assertRedirect(route('board.show', $workspace));

    $issue->refresh();
    expect($issue->status)->toBe(IssueStatus::Done)
        ->and($issue->completed_at)->not->toBeNull()
        ->and($project->issues()->where('status', IssueStatus::Done)->orderBy('position')->pluck('id')->all())->toBe([$first->id, $issue->id, $second->id]);

    $activity = $issue->activities()->sole();
    expect($activity->type)->toBe(ActivityType::StatusChanged)
        ->and($activity->payload)->toMatchArray(['from' => 'todo', 'to' => 'done']);

    // Back to an open column clears completed_at.
    $this->actingAs($user)
        ->patch(route('board.move', [$workspace, $project, $issue]), ['status' => 'in_progress', 'position' => 0, 'beforeId' => null, 'afterId' => null])
        ->assertRedirect();

    expect($issue->refresh()->completed_at)->toBeNull()
        ->and($issue->status)->toBe(IssueStatus::InProgress);
});

test('reordering within a column does not record activity and falls back to the index', function () {
    [$workspace, $user, $project] = workspaceWith();
    [$a, $b, $c] = Issue::factory(3)->sequence(fn (Sequence $sequence) => ['number' => $sequence->index + 1, 'position' => $sequence->index])
        ->create(['project_id' => $project->id, 'status' => IssueStatus::Todo])
        ->all();

    $this->actingAs($user)
        ->patch(route('board.move', [$workspace, $project, $c]), ['status' => 'todo', 'position' => 0, 'beforeId' => null, 'afterId' => null])
        ->assertRedirect();

    expect($project->issues()->orderBy('position')->pluck('id')->all())->toBe([$c->id, $a->id, $b->id])
        ->and($c->activities()->count())->toBe(0);

    // A stale index beyond the end of the column is clamped.
    $this->actingAs($user)
        ->patch(route('board.move', [$workspace, $project, $c]), ['status' => 'todo', 'position' => 99, 'beforeId' => null, 'afterId' => null])
        ->assertRedirect();

    expect($project->issues()->orderBy('position')->pluck('id')->all())->toBe([$a->id, $b->id, $c->id]);
});

test('moving validates the input and scopes neighbours to the workspace', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $foreign = Issue::factory()->create();

    $this->actingAs($user)
        ->patch(route('board.move', [$workspace, $project, $issue]), ['status' => 'nope', 'position' => -1, 'beforeId' => $foreign->id])
        ->assertSessionHasErrors(['status', 'position', 'beforeId']);
});

test('guests cannot move issues', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = User::factory()->create();
    $workspace->members()->attach($guest->id, ['role' => WorkspaceRole::Guest]);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);

    $this->actingAs($guest)->get(route('board.show', $workspace))->assertOk();

    $this->actingAs($guest)
        ->patch(route('board.move', [$workspace, $project, $issue]), ['status' => 'done', 'position' => 0])
        ->assertForbidden();

    expect($issue->refresh()->status)->toBe(IssueStatus::Todo);
});

test('the board reloads only its columns after a move', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);

    $this->actingAs($user)
        ->get(route('board.show', $workspace))
        ->assertInertia(fn (Assert $page) => $page->reloadOnly('columns', fn (Assert $reload) => $reload
            ->has('columns', count(IssueStatus::cases()))
            ->missing('projects')));
});
