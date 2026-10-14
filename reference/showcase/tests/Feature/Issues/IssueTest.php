<?php

use App\Enums\ActivityType;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

test('issues index lists open issues with filters', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $open = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo, 'priority' => IssuePriority::High, 'assignee_id' => $user->id, 'due_on' => '2026-11-01']);
    $open->labels()->attach($label);
    Comment::factory()->create(['issue_id' => $open->id, 'user_id' => $user->id]);
    Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Done, 'priority' => IssuePriority::Low]);

    $this->actingAs($user)
        ->get(route('issues.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('issues/index')
            ->has('issues.data', 1)
            ->where('issues.data.0.identifier', 'TRK-1')
            ->where('issues.data.0.dueOn', '2026-11-01')
            ->where('issues.data.0.commentsCount', 1)
            ->where('workspace.slug', $workspace->slug)
            ->where('filters.sort', 'newest'));

    $this->actingAs($user)
        ->get(route('issues.index', [$workspace, 'statuses' => ['done', 'bogus'], 'priorities' => ['3'], 'includeClosed' => 1, 'sort' => 'priority']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.statuses', ['done'])
            ->where('filters.priorities', [3])
            ->where('filters.sort', 'priority')
            ->has('issues.data', 0));
});

test('non-members cannot see a workspace', function () {
    [$workspace] = workspaceWith();

    $this->actingAs(User::factory()->create())
        ->get(route('issues.index', $workspace))
        ->assertNotFound();
});

test('an issue can be created with labels and is numbered per project', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get(route('issues.create', [$workspace, 'project' => 'TRK']))
        ->assertInertia(fn (Assert $page) => $page->where('defaults.projectId', $project->id)->where('defaults.status', 'todo'));

    $this->actingAs($user)
        ->post(route('issues.store', $workspace), [
            'projectId' => $project->id,
            'title' => 'Ship the template',
            'description' => null,
            'status' => 'in_progress',
            'priority' => 3,
            'assigneeId' => $user->id,
            'labelIds' => [$label->id],
            'estimate' => 5,
            'dueOn' => '2026-12-24',
            'parentId' => null,
            'cycleId' => null,
        ])
        ->assertRedirect(route('issues.show', [$workspace, $project, 1]));

    $issue = Issue::query()->sole();
    expect($issue->title)->toBe('Ship the template')
        ->and($issue->status)->toBe(IssueStatus::InProgress)
        ->and($issue->due_on?->toDateString())->toBe('2026-12-24')
        ->and($issue->labels()->pluck('labels.id')->all())->toBe([$label->id])
        ->and($issue->activities()->sole()->type)->toBe(ActivityType::IssueCreated);
});

test('issue validation uses camelCase keys scoped to the workspace', function () {
    [$workspace, $user] = workspaceWith();
    $foreignLabel = Label::factory()->create();

    $this->actingAs($user)
        ->post(route('issues.store', $workspace), [
            'projectId' => null,
            'title' => '',
            'status' => 'nope',
            'priority' => 9,
            'labelIds' => [$foreignLabel->id],
            'estimate' => 500,
            'dueOn' => '24/12/2026',
        ])
        ->assertSessionHasErrors(['projectId', 'title', 'status', 'priority', 'labelIds.0', 'estimate', 'dueOn']);
});

test('the issue page defers comments and activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('issues/show')
            ->where('issue.identifier', 'TRK-1')
            ->missing('comments')
            ->missing('activity')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('comments', 1)
                ->where('comments.0.can.update', true)
                ->has('activity')));
});

test('inline updates change only the given fields and record activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $assignee = User::factory()->create();
    $workspace->members()->attach($assignee->id, ['role' => WorkspaceRole::Member]);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo, 'title' => 'Keep me']);

    $this->actingAs($user)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['status' => 'done', 'assigneeId' => $assignee->id])
        ->assertRedirect();

    $issue->refresh();
    expect($issue->title)->toBe('Keep me')
        ->and($issue->status)->toBe(IssueStatus::Done)
        ->and($issue->completed_at)->not->toBeNull()
        ->and($issue->assignee_id)->toBe($assignee->id)
        ->and($issue->activities()->pluck('type')->all())->toEqualCanonicalizing([ActivityType::StatusChanged, ActivityType::AssigneeChanged]);
});

test('guests cannot edit issues', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = User::factory()->create();
    $workspace->members()->attach($guest->id, ['role' => WorkspaceRole::Guest]);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($guest)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['status' => 'done'])
        ->assertForbidden();
});

test('issues can be bulk updated', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issues = Issue::factory(3)->create(['project_id' => $project->id, 'priority' => IssuePriority::Low]);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => $issues->pluck('id')->all(), 'priority' => 4])
        ->assertRedirect();

    expect(Issue::query()->pluck('priority')->unique()->all())->toBe([IssuePriority::Urgent]);
});

test('issues from another workspace cannot be bulk updated', function () {
    [$workspace, $user] = workspaceWith();
    $foreign = Issue::factory()->create();

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => [$foreign->id], 'status' => 'done'])
        ->assertSessionHasErrors('ids.0');
});

test('issues of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    [, , $otherProject] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $otherProject->id]);

    $this->actingAs($user)
        ->get("/w/{$workspace->slug}/projects/{$otherProject->key}/issues/{$issue->number}")
        ->assertNotFound();
});

test('dashboard redirects to the current workspace', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('workspace.dashboard', $workspace));
    $this->actingAs(User::factory()->create())->get(route('dashboard'))->assertRedirect(route('workspaces.create'));
});

test('workspace switcher lists every workspace of the user', function () {
    [$workspace, $user] = workspaceWith();
    $other = Workspace::factory()->create();
    $other->members()->attach($user->id, ['role' => WorkspaceRole::Guest]);

    $this->actingAs($user)
        ->get(route('issues.index', $workspace))
        ->assertInertia(fn (Assert $page) => $page->has('workspaces', 2)->where('workspace.can.manage', true));
});

test('stale or hand-edited filter URLs fall back to defaults instead of failing', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('issues.index', [$workspace, 'statuses' => ['todo', 'bogus'], 'priorities' => ['9', '2'], 'assigneeId' => 'abc', 'sort' => 'sideways', 'labelIds' => 'x']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.statuses', ['todo'])
            ->where('filters.priorities', [2])
            ->where('filters.assigneeId', null)
            ->where('filters.sort', 'newest')
            ->where('filters.labelIds', []));
});
