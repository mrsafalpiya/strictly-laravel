<?php

use App\Actions\RecordActivity;
use App\Data\Activity\AssigneeChangedPayload;
use App\Data\Activity\CommentedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Activity\MemberJoinedPayload;
use App\Data\Activity\PriorityChangedPayload;
use App\Data\Activity\StatusChangedPayload;
use App\Data\Users\UserSummaryData;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * The behaviour tests leave some optional shapes empty (an unassigned issue, no passkeys, …), and a
 * type is only proven by the recorded contracts for values a test actually produced. These tests fill
 * every nullable, optional, list and union shape once. `php artisan types:coverage` lists what is
 * still unverified.
 */

test('an issue with every relation filled', function () {
    [$workspace, $user, $project] = workspaceWith();
    $cycle = Cycle::factory()->create(['workspace_id' => $workspace->id]);
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $parent = Issue::factory()->create(['project_id' => $project->id]);
    $issue = Issue::factory()->create([
        'project_id' => $project->id,
        'assignee_id' => $user->id,
        'cycle_id' => $cycle->id,
        'parent_id' => $parent->id,
        'estimate' => 3,
        'due_on' => '2026-11-01',
        'status' => IssueStatus::Done,
        'completed_at' => now(),
    ]);
    $issue->labels()->attach($label);
    Issue::factory()->create(['project_id' => $project->id, 'parent_id' => $issue->id]);
    app(RecordActivity::class)->handle($workspace, $user, $issue->load('project'), new IssueCreatedPayload);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('issue.assignee.id', $user->id)
            ->has('issue.children', 1)
            ->has('options.cycles', 1)
            ->loadDeferredProps(fn (Assert $reload) => $reload->has('activity', 1)));
});

test('the activity feed renders every activity type', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id])->load('project');
    $record = app(RecordActivity::class);
    $someone = UserSummaryData::fromModel($user);

    $record->handle($workspace, $user, $issue, new IssueCreatedPayload);
    $record->handle($workspace, $user, $issue, new StatusChangedPayload(from: IssueStatus::Todo, to: IssueStatus::Done));
    $record->handle($workspace, $user, $issue, new PriorityChangedPayload(from: IssuePriority::Low, to: IssuePriority::High));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: null, to: $someone));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: $someone, to: null));
    $record->handle($workspace, $user, $issue, new CommentedPayload(commentId: 1, excerpt: 'Looks good'));
    $record->handle($workspace, $user, null, new MemberJoinedPayload(role: WorkspaceRole::Member));

    $this->actingAs($user)
        ->get(route('workspace.dashboard', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload->has('recentActivity', 7)));

    $this->actingAs($user)->get(route('activity.index', $workspace))->assertOk();
});

test('auth and settings pages with a status message', function () {
    $this->withSession(['status' => 'We have emailed your password reset link.'])
        ->get(route('password.request'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'We have emailed your password reset link.'));

    $this->withSession(['status' => 'Your password has been reset.'])
        ->get(route('login'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'Your password has been reset.'));

    $this->actingAs(User::factory()->unverified()->create())
        ->withSession(['status' => 'verification-link-sent'])
        ->get(route('verification.notice'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'verification-link-sent'));

    $this->actingAs(User::factory()->create())
        ->withSession(['status' => 'verification-link-sent'])
        ->get(route('profile.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'verification-link-sent'));
});

test('the security page lists passkeys', function () {
    $user = User::factory()->create();
    $user->passkeys()->create([
        'name' => 'MacBook Pro',
        'credential_id' => 'credential-1',
        'credential' => ['aaguid' => '00000000-0000-0000-0000-000000000000'],
    ]);
    $user->passkeys()->create([
        'name' => 'Phone',
        'credential_id' => 'credential-2',
        'credential' => ['aaguid' => 'a11a5faa-9f32-4b8c-8c5d-2f7d13e8c942'],
    ])->forceFill(['last_used_at' => now()->subDay()])->save();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('passkeys.0.name', 'MacBook Pro'));
});
