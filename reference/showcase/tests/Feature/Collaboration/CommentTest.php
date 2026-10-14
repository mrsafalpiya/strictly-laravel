<?php

use App\Enums\ActivityType;
use App\Enums\Reaction as ReactionEmoji;
use App\Enums\WorkspaceRole;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Reaction;
use App\Notifications\CommentAdded;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Collaboration\Members;

test('a comment is stored, recorded as activity and notifies assignee and reporter but not the author', function () {
    Notification::fake();
    [$workspace, $user, $project] = workspaceWith();
    $assignee = Members::add($workspace, WorkspaceRole::Member);
    $reporter = Members::add($workspace, WorkspaceRole::Member);
    $issue = Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $assignee->id, 'reporter_id' => $reporter->id]);

    $this->actingAs($user)
        ->from(route('issues.show', [$workspace, $project, $issue]))
        ->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Looks good to me'])
        ->assertRedirect(route('issues.show', [$workspace, $project, $issue]));

    $comment = Comment::query()->sole();
    expect($comment->body)->toBe('Looks good to me')
        ->and($comment->user_id)->toBe($user->id)
        ->and($issue->activities()->sole()->type)->toBe(ActivityType::Commented);

    Notification::assertSentTo([$assignee, $reporter], CommentAdded::class, fn (CommentAdded $notification) => $notification->payload->commentId === $comment->id
        && $notification->payload->issue->identifier === 'TRK-1');
    Notification::assertNotSentTo($user, CommentAdded::class);
});

test('the author is not notified about their own comment on their own issue', function () {
    Notification::fake();
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id, 'assignee_id' => $user->id, 'reporter_id' => $user->id]);

    $this->actingAs($user)->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Note to self']);

    Notification::assertNothingSent();
});

test('comment bodies are validated', function (mixed $body) {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->post(route('comments.store', [$workspace, $project, $issue]), ['body' => $body])
        ->assertSessionHasErrors('body');
})->with([
    'empty' => '',
    'missing' => null,
    'too long' => str_repeat('a', 10_001),
]);

test('guests cannot comment', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = Members::add($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($guest)
        ->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'Hi'])
        ->assertForbidden();
});

test('the thread reloads only the deferred comments prop', function () {
    [$workspace, $user, $project] = workspaceWith();
    $other = Members::add($workspace, WorkspaceRole::Member);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $mine = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id, 'edited_at' => now()]);
    Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $other->id]);
    Reaction::query()->create(['comment_id' => $mine->id, 'user_id' => $user->id, 'emoji' => ReactionEmoji::Heart]);
    Reaction::query()->create(['comment_id' => $mine->id, 'user_id' => $other->id, 'emoji' => ReactionEmoji::Heart]);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertInertia(fn (Assert $page) => $page
            ->missing('comments')
            ->reloadOnly('comments', fn (Assert $reload) => $reload
                ->missing('issue')
                ->has('comments', 2)
                ->where('comments.0.reactions.0.emoji', '❤️')
                ->where('comments.0.reactions.0.count', 2)
                ->where('comments.0.reactions.0.reacted', true)
                ->whereNot('comments.0.editedAt', null)
                ->where('comments.1.can.update', false)
                ->where('comments.1.can.delete', true)));
});

test('only the author can edit a comment, which marks it as edited', function () {
    [$workspace, $user, $project] = workspaceWith(WorkspaceRole::Member);
    $other = Members::add($workspace, WorkspaceRole::Owner);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);

    $this->actingAs($other)
        ->patch(route('comments.update', [$workspace, $project, $issue, $comment]), ['body' => 'Hijacked'])
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('comments.update', [$workspace, $project, $issue, $comment]), ['body' => 'Fixed a typo'])
        ->assertRedirect();

    $comment->refresh();
    expect($comment->body)->toBe('Fixed a typo')->and($comment->edited_at)->not->toBeNull();
});

test('a comment can be deleted by its author or a manager, not by other members', function () {
    [$workspace, $owner, $project] = workspaceWith();
    $author = Members::add($workspace, WorkspaceRole::Member);
    $member = Members::add($workspace, WorkspaceRole::Member);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    [$first, $second] = Comment::factory(2)->create(['issue_id' => $issue->id, 'user_id' => $author->id])->all();

    $this->actingAs($member)->delete(route('comments.destroy', [$workspace, $project, $issue, $first]))->assertForbidden();
    $this->actingAs($author)->delete(route('comments.destroy', [$workspace, $project, $issue, $first]))->assertRedirect();
    $this->actingAs($owner)->delete(route('comments.destroy', [$workspace, $project, $issue, $second]))->assertRedirect();

    expect(Comment::query()->count())->toBe(0);
});

test('reactions toggle per user and emoji', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $user->id]);
    $url = route('comments.react', [$workspace, $project, $issue, $comment]);

    $this->actingAs($user)->post($url, ['emoji' => '🎉'])->assertRedirect();
    $this->actingAs($user)->post($url, ['emoji' => '👍'])->assertRedirect();
    expect($comment->reactions()->pluck('emoji')->all())->toEqualCanonicalizing([ReactionEmoji::Tada, ReactionEmoji::ThumbsUp]);

    $this->actingAs($user)->post($url, ['emoji' => '🎉'])->assertRedirect();
    expect($comment->reactions()->pluck('emoji')->all())->toBe([ReactionEmoji::ThumbsUp]);

    $this->actingAs($user)->post($url, ['emoji' => '💩'])->assertSessionHasErrors('emoji');
});

test('comments of another issue are not reachable through this one', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $otherIssue = Issue::factory()->create(['project_id' => $project->id]);
    $comment = Comment::factory()->create(['issue_id' => $otherIssue->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('comments.update', [$workspace, $project, $issue, $comment]), ['body' => 'Nope'])
        ->assertNotFound();
});
