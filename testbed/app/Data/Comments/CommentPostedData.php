<?php

namespace App\Data\Comments;

use App\Data\Issues\IssueReferenceData;
use App\Data\Users\UserSummaryData;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\KeyOf;

/**
 * Broadcast to the workspace when a comment is posted (App\Events\CommentPosted): the same for every member, so it
 * carries no viewer's abilities. An open issue page reloads its thread when `issueId` is its issue.
 */
final class CommentPostedData extends Data
{
    public function __construct(
        #[KeyOf(Issue::class)]
        public int $issueId,
        public IssueReferenceData $issue,
        public UserSummaryData $author,
        #[KeyOf(Comment::class)]
        public int $commentId,
        public string $excerpt,
    ) {}

    /** Requires the issue's project relation. */
    public static function fromModels(Issue $issue, Comment $comment, User $author): self
    {
        return new self(
            issueId: $issue->id,
            issue: IssueReferenceData::fromModel($issue),
            author: UserSummaryData::fromModel($author),
            commentId: $comment->id,
            excerpt: Str::limit($comment->body, 140),
        );
    }
}
