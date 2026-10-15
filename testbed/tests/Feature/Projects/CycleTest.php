<?php

use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Date;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->travelTo(Date::parse('2026-10-14 12:00:00')));

function cycleIn(Workspace $workspace, string $name, string $startsOn, string $endsOn): Cycle
{
    return Cycle::factory()->create(['workspace_id' => $workspace->id, 'name' => $name, 'starts_on' => $startsOn, 'ends_on' => $endsOn]);
}

test('cycles index groups cycles into current, upcoming and past', function () {
    [$workspace, $user, $project] = workspaceWith();
    $current = cycleIn($workspace, 'Now', '2026-10-05', '2026-10-18');
    cycleIn($workspace, 'Next', '2026-10-19', '2026-11-01');
    cycleIn($workspace, 'Later', '2026-11-02', '2026-11-15');
    cycleIn($workspace, 'Old', '2026-09-07', '2026-09-20');
    cycleIn($workspace, 'Previous', '2026-09-21', '2026-10-04');
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $current->id, 'status' => IssueStatus::Done]);
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $current->id, 'status' => IssueStatus::Todo]);

    $this->actingAs($user)
        ->get(route('cycles.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cycles/index')
            ->where('current.name', 'Now')
            ->where('current.startsOn', '2026-10-05')
            ->where('current.endsOn', '2026-10-18')
            ->where('current.issuesCount', 2)
            ->where('current.completedIssuesCount', 1)
            ->where('upcoming.0.name', 'Next')
            ->where('upcoming.1.name', 'Later')
            ->where('past.0.name', 'Previous')
            ->where('past.1.name', 'Old')
            ->where('defaults', ['name' => 'Cycle 6', 'startsOn' => '2026-11-16', 'endsOn' => '2026-11-29']));
});

test('an empty workspace gets a current-cycle default and no current cycle', function () {
    [$workspace, $user] = workspaceWith(WorkspaceRole::Guest);

    $this->actingAs($user)
        ->get(route('cycles.index', $workspace))
        ->assertInertia(fn (Assert $page) => $page
            ->where('current', null)
            ->where('upcoming', [])
            ->where('past', [])
            ->where('defaults.startsOn', '2026-10-14'));
});

test('a cycle can be created with date-only start and end', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->post(route('cycles.store', $workspace), ['name' => 'Cycle 1', 'startsOn' => '2026-10-19', 'endsOn' => '2026-11-01'])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('cycles.show', [$workspace, $workspace->cycles()->sole()]));

    $cycle = $workspace->cycles()->sole();
    expect($cycle->starts_on->toDateString())->toBe('2026-10-19')
        ->and($cycle->ends_on->toDateString())->toBe('2026-11-01');
});

test('cycle dates are validated', function (array $payload, array $errors) {
    [$workspace, $user] = workspaceWith();
    cycleIn($workspace, 'Existing', '2026-10-05', '2026-10-18');

    $this->actingAs($user)
        ->post(route('cycles.store', $workspace), ['name' => 'New', ...$payload])
        ->assertSessionHasErrors($errors);

    expect($workspace->cycles()->count())->toBe(1);
})->with([
    'bad format' => [['startsOn' => '19/10/2026', 'endsOn' => '2026-11-01'], ['startsOn']],
    'end before start' => [['startsOn' => '2026-11-01', 'endsOn' => '2026-10-19'], ['endsOn']],
    'end equals start' => [['startsOn' => '2026-11-01', 'endsOn' => '2026-11-01'], ['endsOn']],
    'overlaps the end' => [['startsOn' => '2026-10-18', 'endsOn' => '2026-10-30'], ['startsOn' => 'Overlaps with Existing (2026-10-05 – 2026-10-18).']],
    'contains it' => [['startsOn' => '2026-10-01', 'endsOn' => '2026-10-30'], ['startsOn']],
    'inside it' => [['startsOn' => '2026-10-07', 'endsOn' => '2026-10-08'], ['startsOn']],
]);

test('another workspace\'s cycles do not count as overlapping', function () {
    [$workspace, $user] = workspaceWith();
    cycleIn(Workspace::factory()->create(), 'Elsewhere', '2026-10-05', '2026-10-18');

    $this->actingAs($user)
        ->post(route('cycles.store', $workspace), ['name' => 'Mine', 'startsOn' => '2026-10-05', 'endsOn' => '2026-10-18'])
        ->assertSessionHasNoErrors();
});

test('a cycle can be updated without overlapping itself', function () {
    [$workspace, $user] = workspaceWith();
    $cycle = cycleIn($workspace, 'Now', '2026-10-05', '2026-10-18');
    cycleIn($workspace, 'Next', '2026-10-19', '2026-11-01');

    $this->actingAs($user)
        ->patch(route('cycles.update', [$workspace, $cycle]), ['name' => 'Renamed', 'startsOn' => '2026-10-06', 'endsOn' => '2026-10-18'])
        ->assertSessionHasNoErrors();

    expect($cycle->refresh()->name)->toBe('Renamed')->and($cycle->starts_on->toDateString())->toBe('2026-10-06');

    $this->actingAs($user)
        ->patch(route('cycles.update', [$workspace, $cycle]), ['name' => 'Renamed', 'startsOn' => '2026-10-06', 'endsOn' => '2026-10-20'])
        ->assertSessionHasErrors('startsOn');
});

test('the cycle page groups issues by status and defers stats with a burndown', function () {
    [$workspace, $user, $project] = workspaceWith();
    $cycle = cycleIn($workspace, 'Now', '2026-10-10', '2026-10-23');
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id, 'status' => IssueStatus::Todo, 'assignee_id' => null, 'estimate' => null, 'due_on' => null]);
    $assigned = Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id, 'status' => IssueStatus::InProgress, 'assignee_id' => $user->id, 'estimate' => 3, 'due_on' => '2026-10-20']);
    $assigned->labels()->attach(Label::factory()->create(['workspace_id' => $workspace->id, 'name' => 'bug']));
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id, 'status' => IssueStatus::Done, 'completed_at' => '2026-10-11 09:00:00']);
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id, 'status' => IssueStatus::Done, 'completed_at' => '2026-10-13 18:00:00']);
    Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id, 'status' => IssueStatus::Canceled, 'completed_at' => '2026-10-12 10:00:00']);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]); // not in the cycle

    $this->actingAs($user)
        ->get(route('cycles.show', [$workspace, $cycle]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cycles/show')
            ->where('cycle.name', 'Now')
            ->where('cycle.issuesCount', 5)
            ->where('cycle.completedIssuesCount', 2)
            ->has('issuesByStatus', 6)
            ->has('issuesByStatus.backlog', 0)
            ->has('issuesByStatus.todo', 1)
            ->where('issuesByStatus.todo.0.identifier', 'TRK-1')
            ->where('issuesByStatus.todo.0.assignee', null)
            ->where('issuesByStatus.in_progress.0.assignee.id', $user->id)
            ->where('issuesByStatus.in_progress.0.estimate', 3)
            ->where('issuesByStatus.in_progress.0.dueOn', '2026-10-20')
            ->where('issuesByStatus.in_progress.0.labels.0.name', 'bug')
            ->has('issuesByStatus.done', 2)
            ->has('issuesByStatus.canceled', 1)
            ->where('defaults', ['name' => 'Now', 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-23'])
            ->missing('stats')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('stats.scope', 4)
                ->where('stats.completed', 2)
                ->where('stats.percent', 50)
                ->has('stats.burndown', 5)
                ->where('stats.burndown', [
                    ['date' => '2026-10-10', 'remaining' => 4],
                    ['date' => '2026-10-11', 'remaining' => 3],
                    ['date' => '2026-10-12', 'remaining' => 3],
                    ['date' => '2026-10-13', 'remaining' => 2],
                    ['date' => '2026-10-14', 'remaining' => 2],
                ])));
});

test('an upcoming cycle has an empty burndown', function () {
    [$workspace, $user] = workspaceWith(WorkspaceRole::Member);
    $cycle = cycleIn($workspace, 'Next', '2026-10-19', '2026-11-01');

    $this->actingAs($user)
        ->get(route('cycles.show', [$workspace, $cycle]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('stats', ['scope' => 0, 'completed' => 0, 'percent' => 0, 'burndown' => []])));
});

test('deleting a cycle keeps its issues', function () {
    [$workspace, $user, $project] = workspaceWith();
    $cycle = cycleIn($workspace, 'Now', '2026-10-05', '2026-10-18');
    $issue = Issue::factory()->create(['project_id' => $project->id, 'cycle_id' => $cycle->id]);

    $this->actingAs($user)
        ->delete(route('cycles.destroy', [$workspace, $cycle]))
        ->assertRedirect(route('cycles.index', $workspace));

    expect(Cycle::query()->count())->toBe(0)
        ->and($issue->refresh()->cycle_id)->toBeNull();
});

test('only managers can write cycles, everyone can view', function () {
    [$workspace] = workspaceWith();
    $cycle = cycleIn($workspace, 'Now', '2026-10-05', '2026-10-18');
    $member = User::factory()->create();
    $workspace->members()->attach($member->id, ['role' => WorkspaceRole::Member]);
    $payload = ['name' => 'X', 'startsOn' => '2026-12-01', 'endsOn' => '2026-12-14'];

    $this->actingAs($member)->get(route('cycles.index', $workspace))->assertOk();
    $this->actingAs($member)->get(route('cycles.show', [$workspace, $cycle]))->assertOk();
    $this->actingAs($member)->post(route('cycles.store', $workspace), $payload)->assertForbidden();
    $this->actingAs($member)->patch(route('cycles.update', [$workspace, $cycle]), $payload)->assertForbidden();
    $this->actingAs($member)->delete(route('cycles.destroy', [$workspace, $cycle]))->assertForbidden();
});

test('cycles of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    $foreign = Cycle::factory()->create();

    $this->actingAs($user)->get(route('cycles.show', [$workspace, $foreign]))->assertNotFound();
});
