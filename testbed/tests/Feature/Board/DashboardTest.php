<?php

use App\Actions\RecordActivity;
use App\Data\Activity\StatusChangedPayload;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\User;
use App\Pages\Workspaces\DashboardPage;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // A Wednesday, so "this week" started two days ago.
    $this->travelTo(CarbonImmutable::parse('2026-10-14 12:00:00'));
});

test('the dashboard shows stat cards and my issues immediately and defers the charts and activity', function () {
    [$workspace, $user, $project] = workspaceWith();
    $other = User::factory()->create();

    $urgent = Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $user->id, 'status' => IssueStatus::Todo, 'priority' => IssuePriority::Urgent, 'due_on' => '2026-10-16', 'completed_at' => null]);
    Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $user->id, 'status' => IssueStatus::InProgress, 'priority' => IssuePriority::Low, 'due_on' => '2026-12-01', 'completed_at' => null]);
    Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $user->id, 'status' => IssueStatus::Done, 'completed_at' => '2026-10-13 09:00:00', 'created_at' => '2026-09-01 09:00:00']);
    Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $other->id, 'status' => IssueStatus::Todo, 'created_at' => '2026-08-01 09:00:00', 'completed_at' => null]);

    app(RecordActivity::class)->handle($workspace, $user, $urgent, new StatusChangedPayload(from: IssueStatus::Backlog, to: IssueStatus::Todo));

    $this->actingAs($user)
        ->get(route('workspace.dashboard', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('workspaces/dashboard')
            ->where('stats.myOpenIssues', 2)
            ->where('stats.dueWithinWeek', 1)
            ->where('stats.createdThisWeek', 2)
            ->where('stats.completedThisWeek', 1)
            ->has('assignedToMe', 2)
            ->where('assignedToMe.0.id', $urgent->id)
            ->where('assignedToMe.0.dueOn', '2026-10-16')
            ->missing('statusCounts')
            ->missing('throughput')
            ->missing('recentActivity')
            ->loadDeferredProps(DashboardPage::CHARTS, fn (Assert $reload) => $reload
                ->where('statusCounts', ['backlog' => 0, 'todo' => 2, 'in_progress' => 1, 'in_review' => 0, 'done' => 1, 'canceled' => 0])
                ->has('throughput', 8)
                ->where('throughput.0.weekStart', '2026-08-24')
                ->where('throughput.7.weekStart', '2026-10-12')
                ->where('throughput.7.created', 2)
                ->where('throughput.7.completed', 1)
                ->where('throughput.6.created', 0)
                ->missing('recentActivity'))
            ->loadDeferredProps('default', fn (Assert $reload) => $reload
                ->has('recentActivity', 1)
                ->where('recentActivity.0.payload.type', 'status_changed')
                ->where('recentActivity.0.issue.identifier', 'TRK-1')
                ->missing('statusCounts')));
});

test('an empty workspace still sends every status and every week', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('workspace.dashboard', $workspace))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.myOpenIssues', 0)
            ->where('assignedToMe', [])
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('statusCounts', array_fill_keys(array_column(IssueStatus::cases(), 'value'), 0))
                ->has('throughput', 8)
                ->where('recentActivity', [])));
});

test('non-members cannot see the dashboard', function () {
    [$workspace] = workspaceWith();

    $this->actingAs(User::factory()->create())
        ->get(route('workspace.dashboard', $workspace))
        ->assertNotFound();
});
