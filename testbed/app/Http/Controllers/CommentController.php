<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Data\Activity\CommentedPayload;
use App\Data\Comments\CommentPostedData;
use App\Data\Comments\StoreCommentData;
use App\Data\Comments\ToggleReactionData;
use App\Data\Comments\UpdateCommentData;
use App\Data\Notifications\CommentAddedNotificationPayload;
use App\Events\CommentPosted;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\CommentAdded;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

/**
 * Every action redirects back to the issue; the thread reloads only the deferred `comments` prop.
 * Routes are nested under the issue, so scoped bindings prove the comment belongs to it.
 */
final class CommentController extends Controller
{
    public function __construct(private readonly RecordActivity $recordActivity) {}

    public function store(StoreCommentData $data, Workspace $workspace, Project $project, Issue $issue, #[CurrentUser] User $user): RedirectResponse
    {
        $comment = $issue->comments()->create(['user_id' => $user->id, 'body' => $data->body]);

        $issue->setRelation('project', $project);
        $this->recordActivity->handle($workspace, $user, $issue, new CommentedPayload(
            commentId: $comment->id,
            excerpt: Str::limit($comment->body, 140),
        ));

        $recipients = User::query()
            ->whereKey(array_filter([$issue->assignee_id, $issue->reporter_id], fn (?int $id): bool => $id !== null && $id !== $user->id))
            ->get();

        Notification::send($recipients, new CommentAdded(
            CommentAddedNotificationPayload::fromModels($workspace, $issue, $comment, $user),
        ));

        // Live to the other members: their open issue page reloads its thread. The author's reloads on its own.
        broadcast(new CommentPosted($workspace, CommentPostedData::fromModels($issue, $comment, $user)))->toOthers();

        return back();
    }

    public function update(UpdateCommentData $data, Workspace $workspace, Project $project, Issue $issue, Comment $comment): RedirectResponse
    {
        $comment->update(['body' => $data->body, 'edited_at' => now()]);

        return back();
    }

    public function destroy(Workspace $workspace, Project $project, Issue $issue, Comment $comment): RedirectResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return back();
    }

    public function react(ToggleReactionData $data, Workspace $workspace, Project $project, Issue $issue, Comment $comment, #[CurrentUser] User $user): RedirectResponse
    {
        $existing = $comment->reactions()->whereBelongsTo($user)->where('emoji', $data->emoji)->first();

        if ($existing === null) {
            $comment->reactions()->create(['user_id' => $user->id, 'emoji' => $data->emoji]);
        } else {
            $existing->delete();
        }

        return back();
    }
}
