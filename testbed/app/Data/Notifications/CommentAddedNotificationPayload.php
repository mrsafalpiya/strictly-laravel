<?php

namespace App\Data\Notifications;

use App\Data\Issues\IssueReferenceData;
use App\Data\Users\UserSummaryData;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\NotificationType;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\RouteKeyOf;

/** Stored as the `data` of a CommentAdded database notification: a snapshot taken when it was sent. */
final class CommentAddedNotificationPayload extends Data
{
    public function __construct(
        #[RouteKeyOf(Workspace::class)]
        public string $workspaceSlug,
        public IssueReferenceData $issue,
        public UserSummaryData $author,
        public int $commentId,
        public string $excerpt,
        /** @var NotificationType::CommentAdded */
        public NotificationType $type = NotificationType::CommentAdded,
    ) {}

    /** Requires the issue's project relation. */
    public static function fromModels(Workspace $workspace, Issue $issue, Comment $comment, User $author): self
    {
        return new self(
            workspaceSlug: $workspace->slug,
            issue: IssueReferenceData::fromModel($issue),
            author: UserSummaryData::fromModel($author),
            commentId: $comment->id,
            excerpt: Str::limit($comment->body, 140),
        );
    }
}
