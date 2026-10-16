<?php

use App\Actions\RecordActivity;
use App\Data\Activity\AssigneeChangedPayload;
use App\Data\Activity\CommentedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Activity\PriorityChangedPayload;
use App\Data\Activity\StatusChangedPayload;
use App\Data\Users\UserSummaryData;
use App\Enums\ActivityType;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Comment;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

/** Adds a member with the given role to the workspace. */
function issueMember(Workspace $workspace, WorkspaceRole $role = WorkspaceRole::Member): User
{
    $user = User::factory()->create();
    $workspace->members()->attach($user->id, ['role' => $role]);

    return $user;
}

test('issues index lists open issues with filters', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $open = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo, 'priority' => IssuePriority::High, 'assignee_id' => $user->id, 'due_on' => '2026-11-01', 'estimate' => 3]);
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
            ->where('issues.data.0.assignee.id', $user->id)
            ->where('workspace.slug', $workspace->slug)
            ->where('filters.sort', 'newest')
            ->has('options.projects', 1)
            ->has('options.labels', 1));

    $this->actingAs($user)
        ->get(route('issues.index', [$workspace, 'statuses' => ['done', 'bogus'], 'priorities' => ['3'], 'includeClosed' => 1, 'sort' => 'priority']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.statuses', ['done'])
            ->where('filters.priorities', [3])
            ->where('filters.sort', 'priority')
            ->where('filters.includeClosed', true)
            ->has('issues.data', 0));
});

test('every filter narrows the list and round-trips through the query string', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $match = Issue::factory()->create(['project_id' => $project->id, 'title' => 'Fix the 100% bug', 'status' => IssueStatus::InProgress, 'priority' => IssuePriority::Urgent, 'assignee_id' => $user->id]);
    $match->labels()->attach($label);
    Issue::factory()->create(['project_id' => $project->id, 'title' => 'Fix the 100% bug too', 'status' => IssueStatus::InProgress, 'priority' => IssuePriority::Urgent, 'assignee_id' => null]);
    Issue::factory()->create(['project_id' => $project->id, 'title' => 'Something else', 'status' => IssueStatus::InProgress, 'priority' => IssuePriority::Urgent, 'assignee_id' => $user->id]);

    $query = [
        'search' => '100%',
        'statuses' => ['in_progress'],
        'priorities' => [4],
        'labelIds' => [$label->id],
        'assigneeId' => $user->id,
        'projectKey' => 'TRK',
        'sort' => 'due_date',
    ];

    $this->actingAs($user)
        ->get(route('issues.index', [$workspace, ...$query]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('issues.data', 1)
            ->where('issues.data.0.id', $match->id)
            ->where('filters.search', '100%')
            ->where('filters.labelIds', [$label->id])
            ->where('filters.assigneeId', $user->id)
            ->where('filters.projectKey', 'TRK')
            ->where('filters.sort', 'due_date'));
});

test('the list is paginated and pages keep the filters', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory(30)->create(['project_id' => $project->id, 'status' => IssueStatus::Todo]);

    $this->actingAs($user)
        ->get(route('issues.index', [$workspace, 'sort' => 'oldest', 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('issues.data', 5)
            ->where('issues.meta.current_page', 2)
            ->where('issues.meta.last_page', 2)
            ->where('issues.meta.prev_page_url', fn (string $url) => str_contains($url, 'sort=oldest'))
            ->where('issues.meta.next_page_url', null));
});

test('non-members cannot see a workspace', function () {
    [$workspace] = workspaceWith();

    $this->actingAs(User::factory()->create())
        ->get(route('issues.index', $workspace))
        ->assertNotFound();
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

test('the create page preselects the project from the query string and sends empty defaults', function () {
    [$workspace, $user, $project] = workspaceWith();
    Cycle::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->get(route('issues.create', [$workspace, 'project' => 'TRK']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('issues/create')
            ->where('defaults.projectId', $project->id)
            ->where('defaults.status', 'todo')
            ->where('defaults.labelIds', [])
            ->has('options.cycles', 1)
            ->has('options.members', 1));

    $this->actingAs($user)
        ->get(route('issues.create', [$workspace, 'project' => 'NOPE']))
        ->assertInertia(fn (Assert $page) => $page->where('defaults.projectId', null));
});

test('an issue can be created with labels and is numbered per project', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $cycle = Cycle::factory()->create(['workspace_id' => $workspace->id]);
    $parent = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->post(route('issues.store', $workspace), [
            'projectId' => $project->id,
            'title' => 'Ship the template',
            'description' => 'With every Type Boundary typed.',
            'status' => 'in_progress',
            'priority' => 3,
            'assigneeId' => $user->id,
            'labelIds' => [$label->id],
            'estimate' => 5,
            'dueOn' => '2026-12-24',
            'parentId' => $parent->id,
            'cycleId' => $cycle->id,
        ])
        ->assertRedirect(route('issues.show', [$workspace, $project, 2]));

    $issue = Issue::query()->where('number', 2)->sole();
    expect($issue->title)->toBe('Ship the template')
        ->and($issue->status)->toBe(IssueStatus::InProgress)
        ->and($issue->due_on?->toDateString())->toBe('2026-12-24')
        ->and($issue->parent_id)->toBe($parent->id)
        ->and($issue->cycle_id)->toBe($cycle->id)
        ->and($issue->labels()->pluck('labels.id')->all())->toBe([$label->id])
        ->and($issue->activities()->sole()->type)->toBe(ActivityType::IssueCreated);
});

test('an issue created closed is completed, with no labels and nothing optional', function () {
    [$workspace, $user, $project] = workspaceWith();

    $this->actingAs($user)
        ->post(route('issues.store', $workspace), [
            'projectId' => $project->id,
            'title' => 'Already done',
            'description' => null,
            'status' => 'done',
            'priority' => 0,
            'assigneeId' => null,
            'labelIds' => [],
            'estimate' => null,
            'dueOn' => null,
            'parentId' => null,
            'cycleId' => null,
        ])
        ->assertRedirect();

    expect(Issue::query()->sole()->completed_at)->not->toBeNull();
});

test('issue validation uses camelCase keys, item keys for lists, and is scoped to the workspace', function () {
    [$workspace, $user] = workspaceWith();
    $foreignLabel = Label::factory()->create();

    $this->actingAs($user)
        ->post(route('issues.store', $workspace), [
            'projectId' => null,
            'title' => '',
            'description' => null,
            'status' => 'nope',
            'priority' => 9,
            'assigneeId' => null,
            'labelIds' => [$foreignLabel->id],
            'estimate' => 500,
            'dueOn' => '24/12/2026',
            'parentId' => null,
            'cycleId' => null,
        ])
        ->assertSessionHasErrors(['projectId', 'title', 'status', 'priority', 'labelIds.0', 'estimate', 'dueOn']);

    expect(Issue::query()->count())->toBe(0);
});

test('the issue page shows the issue with its relations and defers its activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $cycle = Cycle::factory()->create(['workspace_id' => $workspace->id]);
    $parent = Issue::factory()->create(['project_id' => $project->id, 'reporter_id' => $user->id]);
    $issue = Issue::factory()->create([
        'project_id' => $project->id,
        'title' => 'Typed issue page',
        'description' => 'All of it.',
        'status' => IssueStatus::Done,
        'estimate' => 8,
        'due_on' => '2026-11-02',
        'reporter_id' => $user->id,
        'assignee_id' => $user->id,
        'parent_id' => $parent->id,
        'cycle_id' => $cycle->id,
    ]);
    $issue->labels()->attach($label);
    $child = Issue::factory()->create(['project_id' => $project->id, 'parent_id' => $issue->id]);
    app(RecordActivity::class)->handle($workspace, $user, $issue, new IssueCreatedPayload);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('issues/show')
            ->where('issue.identifier', 'TRK-2')
            ->where('issue.description', 'All of it.')
            ->where('issue.dueOn', '2026-11-02')
            ->where('issue.assignee.id', $user->id)
            ->where('issue.cycle.id', $cycle->id)
            ->where('issue.parent.identifier', 'TRK-1')
            ->where('issue.parent.projectKey', 'TRK')
            ->where('issue.children.0.number', $child->number)
            ->where('issue.labels.0.id', $label->id)
            ->whereType('issue.completedAt', 'string')
            ->where('can.update', true)
            ->where('can.delete', true)
            ->has('attachments', 0)
            ->missing('activity')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('activity', 1)
                ->where('activity.0.payload.type', 'issue_created')
                ->where('activity.0.issue.identifier', 'TRK-2')));
});

test('the issue page shows an open issue with nothing optional set', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create([
        'project_id' => $project->id,
        'status' => IssueStatus::Todo,
        'description' => null,
        'estimate' => null,
        'due_on' => null,
        'assignee_id' => null,
        'parent_id' => null,
        'cycle_id' => null,
    ]);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('issue.description', null)
            ->where('issue.assignee', null)
            ->where('issue.completedAt', null)
            ->where('issue.children', []));
});

test('the activity on the issue page has an entry of every kind an issue gets', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $record = app(RecordActivity::class);
    $someone = UserSummaryData::fromModel($user);

    $record->handle($workspace, $user, $issue, new IssueCreatedPayload);
    $record->handle($workspace, $user, $issue, new StatusChangedPayload(from: IssueStatus::Todo, to: IssueStatus::Done));
    $record->handle($workspace, $user, $issue, new PriorityChangedPayload(from: IssuePriority::Low, to: IssuePriority::High));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: null, to: $someone));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: $someone, to: null));
    // Recorded by the Collaboration area's comments. (`member_joined` is a workspace's, shown in the activity feed.)
    $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);
    $record->handle($workspace, $user, $issue, new CommentedPayload(commentId: $comment->id, excerpt: 'Looks good'));

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('activity', 6)
                ->where('activity.0.payload.type', 'commented')
                ->where('activity.5.payload.type', 'issue_created')));
});

test('issues of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    [, , $otherProject] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $otherProject->id]);

    $this->actingAs($user)
        ->get("/w/{$workspace->slug}/projects/{$otherProject->key}/issues/{$issue->number}")
        ->assertNotFound();
});

test('inline updates change only the given fields and record activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $assignee = issueMember($workspace);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'status' => IssueStatus::Todo, 'priority' => IssuePriority::Low, 'title' => 'Keep me']);

    $this->actingAs($user)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['status' => 'done', 'priority' => 2, 'assigneeId' => $assignee->id])
        ->assertRedirect();

    $issue->refresh();
    expect($issue->title)->toBe('Keep me')
        ->and($issue->status)->toBe(IssueStatus::Done)
        ->and($issue->priority)->toBe(IssuePriority::Medium)
        ->and($issue->completed_at)->not->toBeNull()
        ->and($issue->assignee_id)->toBe($assignee->id)
        ->and($issue->activities()->pluck('type')->all())->toEqualCanonicalizing([ActivityType::StatusChanged, ActivityType::PriorityChanged, ActivityType::AssigneeChanged]);

    $this->actingAs($user)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['status' => 'todo', 'assigneeId' => null])
        ->assertRedirect();

    $issue->refresh();
    expect($issue->completed_at)->toBeNull()
        ->and($issue->assignee_id)->toBeNull();
});

test('every field of an issue can be edited inline', function () {
    [$workspace, $user, $project] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $cycle = Cycle::factory()->create(['workspace_id' => $workspace->id]);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->patch(route('issues.update', [$workspace, $project, $issue]), [
            'title' => 'Renamed',
            'description' => null,
            'labelIds' => [$label->id],
            'estimate' => 13,
            'dueOn' => '2027-01-15',
            'cycleId' => $cycle->id,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $issue->refresh();
    expect($issue->title)->toBe('Renamed')
        ->and($issue->description)->toBeNull()
        ->and($issue->labels()->pluck('labels.id')->all())->toBe([$label->id])
        ->and($issue->estimate)->toBe(13)
        ->and($issue->due_on?->toDateString())->toBe('2027-01-15')
        ->and($issue->cycle_id)->toBe($cycle->id);

    $this->actingAs($user)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['labelIds' => [], 'title' => '', 'estimate' => -1, 'cycleId' => Cycle::factory()->create()->id])
        ->assertSessionHasErrors(['title', 'estimate', 'cycleId']);

    expect($issue->labels()->count())->toBe(1);
});

test('guests cannot edit issues', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = issueMember($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($guest)
        ->patch(route('issues.update', [$workspace, $project, $issue]), ['status' => 'nope'])
        ->assertForbidden();
});

test('an issue can be deleted by its reporter or a manager only', function () {
    [$workspace, $owner, $project] = workspaceWith();
    $reporter = issueMember($workspace);
    $other = issueMember($workspace);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'reporter_id' => $reporter->id]);
    $second = Issue::factory()->create(['project_id' => $project->id, 'reporter_id' => $reporter->id]);

    $this->actingAs($other)->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertInertia(fn (Assert $page) => $page->where('can.update', true)->where('can.delete', false));
    $this->actingAs($other)->delete(route('issues.destroy', [$workspace, $project, $issue]))->assertForbidden();

    $this->actingAs($reporter)->delete(route('issues.destroy', [$workspace, $project, $issue]))
        ->assertRedirect(route('issues.index', $workspace));
    $this->actingAs($owner)->delete(route('issues.destroy', [$workspace, $project, $second]))
        ->assertRedirect(route('issues.index', $workspace));

    expect(Issue::query()->count())->toBe(0);
});

test('issues can be bulk updated', function () {
    [$workspace, $user, $project] = workspaceWith();
    $assignee = issueMember($workspace);
    $issues = Issue::factory(3)->create(['project_id' => $project->id, 'priority' => IssuePriority::Low, 'status' => IssueStatus::Todo]);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => $issues->pluck('id')->all(), 'priority' => 4])
        ->assertRedirect();

    expect(Issue::query()->pluck('priority')->unique()->all())->toBe([IssuePriority::Urgent])
        ->and(Issue::query()->pluck('status')->unique()->all())->toBe([IssueStatus::Todo]);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => $issues->pluck('id')->all(), 'status' => 'in_review', 'assigneeId' => $assignee->id])
        ->assertRedirect();

    expect(Issue::query()->pluck('status')->unique()->all())->toBe([IssueStatus::InReview])
        ->and(Issue::query()->pluck('assignee_id')->unique()->all())->toBe([$assignee->id]);
});

test('issues from another workspace cannot be bulk updated, and a selection is required', function () {
    [$workspace, $user] = workspaceWith();
    $foreign = Issue::factory()->create();

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => [$foreign->id], 'status' => 'done'])
        ->assertSessionHasErrors('ids.0');

    $this->actingAs($user)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => [], 'status' => 'done'])
        ->assertSessionHasErrors('ids');
});

test('guests cannot bulk update', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = issueMember($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($guest)
        ->patch(route('issues.bulk-update', $workspace), ['ids' => [$issue->id], 'status' => 'done'])
        ->assertForbidden();
});

test('guests can neither open the create page nor create issues', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = issueMember($workspace, WorkspaceRole::Guest);

    $this->actingAs($guest)->get(route('issues.create', $workspace))->assertForbidden();
    $this->actingAs($guest)
        ->post(route('issues.store', $workspace), ['projectId' => $project->id, 'title' => 'Nope'])
        ->assertForbidden();
});
