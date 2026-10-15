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
use App\Http\Controllers\ActivityController;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Testing\TestResponse;
use Inertia\Support\Header;
use Inertia\Testing\AssertableInertia as Assert;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

/**
 * The Inertia page object of a full (HTML) visit.
 *
 * @param  TestResponse<Response>  $response
 * @return array<mixed>
 */
function inertiaPage(TestResponse $response): array
{
    $page = $response->viewData('page');

    expect($page)->toBeArray();

    return is_array($page) ? $page : [];
}

/**
 * The cursor <InfiniteScroll> would request next, from the page's scroll metadata.
 *
 * @param  array<mixed>  $page
 */
function nextCursor(array $page): string
{
    $cursor = data_get($page, 'scrollProps.activity.nextPage');

    expect($cursor)->toBeString();

    return is_string($cursor) ? $cursor : '';
}

/**
 * What <InfiniteScroll data="activity"> sends when the user reaches the end of the list.
 *
 * @param  array<mixed>  $page
 * @param  array<string, mixed>  $query
 * @return TestResponse<Response>
 */
function scrollActivity(TestCase $test, Workspace $workspace, array $page, array $query = []): TestResponse
{
    $version = $page['version'] ?? null;

    return $test->get(route('activity.index', [$workspace, ...$query, 'cursor' => nextCursor($page)]), [
        Header::INERTIA => 'true',
        Header::VERSION => is_string($version) ? $version : '',
        Header::PARTIAL_COMPONENT => 'activity/index',
        Header::PARTIAL_ONLY => 'activity',
        Header::INFINITE_SCROLL_MERGE_INTENT => 'append',
    ]);
}

test('the activity feed scrolls through every entry of the workspace with a cursor', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $record = app(RecordActivity::class);

    $record->handle($workspace, $user, null, new MemberJoinedPayload(role: WorkspaceRole::Owner));
    $record->handle($workspace, $user, $issue, new IssueCreatedPayload);
    foreach (range(1, ActivityController::PER_PAGE + 2) as $i) {
        $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);
        $record->handle($workspace, $user, $issue, new CommentedPayload(commentId: $comment->id, excerpt: "Comment {$i}"));
    }
    $record->handle($workspace, $user, $issue, new StatusChangedPayload(from: IssueStatus::Todo, to: IssueStatus::InProgress));

    // Another workspace's activity never shows up.
    [$otherWorkspace, $otherUser] = workspaceWith();
    $record->handle($otherWorkspace, $otherUser, null, new MemberJoinedPayload(role: WorkspaceRole::Owner));

    $first = $this->actingAs($user)->get(route('activity.index', $workspace));

    $first->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('activity/index')
        ->has('activity.data', ActivityController::PER_PAGE)
        ->where('activity.data.0.payload.type', 'status_changed')
        ->where('activity.data.0.payload.to', 'in_progress')
        ->where('activity.data.1.payload.type', 'commented')
        ->where('activity.links', [])
        ->where('activity.meta.per_page', ActivityController::PER_PAGE)
        ->where('activity.meta.prev_cursor', null)
        ->where('filters.types', []));

    $page = inertiaPage($first);
    expect($page['mergeProps'] ?? null)->toBe(['activity.data'])
        ->and(data_get($page, 'scrollProps.activity'))->toMatchArray(['pageName' => 'cursor', 'previousPage' => null, 'currentPage' => 1]);

    $next = scrollActivity($this, $workspace, $page)->assertOk();

    expect($next->json('component'))->toBe('activity/index')
        ->and($next->json('props.activity.data'))->toHaveCount(5)
        ->and($next->json('props.activity.data.4.payload.type'))->toBe('member_joined')
        ->and($next->json('props.activity.data.4.issue'))->toBeNull()
        ->and($next->json('props.activity.meta.next_cursor'))->toBeNull()
        ->and($next->json('props.filters'))->toBeNull()
        ->and($next->json('mergeProps'))->toBe(['activity.data'])
        ->and($next->json('scrollProps.activity.nextPage'))->toBeNull()
        ->and($next->json('scrollProps.activity.previousPage'))->toBeString();
});

test('the activity feed can be filtered by type, and the filter survives scrolling', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $record = app(RecordActivity::class);

    foreach (range(1, ActivityController::PER_PAGE + 1) as $i) {
        $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);
        $record->handle($workspace, $user, $issue, new CommentedPayload(commentId: $comment->id, excerpt: "Comment {$i}"));
        $record->handle($workspace, $user, $issue, new StatusChangedPayload(from: IssueStatus::Todo, to: IssueStatus::Done));
    }

    $query = ['types' => ['status_changed', 'bogus']];
    $first = $this->actingAs($user)->get(route('activity.index', [$workspace, ...$query]));

    $first->assertInertia(fn (Assert $page) => $page
        ->where('filters.types', ['status_changed'])
        ->has('activity.data', ActivityController::PER_PAGE)
        ->where('activity.data.0.payload.type', 'status_changed')
        ->where('activity.data.29.payload.type', 'status_changed'));

    $next = scrollActivity($this, $workspace, inertiaPage($first), $query)->assertOk();

    expect($next->json('props.activity.data'))->toHaveCount(1)
        ->and($next->json('props.activity.data.0.payload.type'))->toBe('status_changed');
});

test('guests can read the activity feed but non-members cannot', function () {
    [$workspace] = workspaceWith();
    $guest = User::factory()->create();
    $workspace->members()->attach($guest->id, ['role' => WorkspaceRole::Guest]);

    $this->actingAs($guest)->get(route('activity.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('activity.data', [])->where('activity.meta.next_cursor', null));

    $this->actingAs(User::factory()->create())->get(route('activity.index', $workspace))->assertNotFound();
});

test('every kind of activity reaches the feed as its own variant of the payload union', function () {
    [$workspace, $user, $project] = workspaceWith();
    $assignee = User::factory()->create(['name' => 'Ada']);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $record = app(RecordActivity::class);

    $record->handle($workspace, $user, $issue, new IssueCreatedPayload);
    $record->handle($workspace, $user, $issue, new StatusChangedPayload(from: IssueStatus::Todo, to: IssueStatus::InReview));
    $record->handle($workspace, $user, $issue, new PriorityChangedPayload(from: IssuePriority::Low, to: IssuePriority::Urgent));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: null, to: UserSummaryData::fromModel($assignee)));
    $record->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: UserSummaryData::fromModel($assignee), to: null));
    $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);
    $record->handle($workspace, $user, $issue, new CommentedPayload(commentId: $comment->id, excerpt: 'Ship it'));
    $record->handle($workspace, $user, null, new MemberJoinedPayload(role: WorkspaceRole::Member));

    $this->actingAs($user)
        ->get(route('activity.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('activity.data', 7)
            ->where('activity.data.0.payload', ['role' => 'member', 'type' => 'member_joined'])
            ->where('activity.data.0.issue', null)
            ->where('activity.data.1.payload', ['commentId' => $comment->id, 'excerpt' => 'Ship it', 'type' => 'commented'])
            ->where('activity.data.2.payload.to', null)
            ->where('activity.data.2.payload.from.name', 'Ada')
            ->where('activity.data.3.payload.to.name', 'Ada')
            ->where('activity.data.3.payload.from', null)
            ->where('activity.data.4.payload', ['from' => IssuePriority::Low->value, 'to' => IssuePriority::Urgent->value, 'type' => 'priority_changed'])
            ->where('activity.data.5.payload', ['from' => 'todo', 'to' => 'in_review', 'type' => 'status_changed'])
            ->where('activity.data.6.payload', ['type' => 'issue_created'])
            ->where('activity.data.6.issue.identifier', $issue->identifier()));
});
