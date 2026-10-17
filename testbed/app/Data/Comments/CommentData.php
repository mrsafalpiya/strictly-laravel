<?php

namespace App\Data\Comments;

use App\Data\Users\UserSummaryData;
use App\Models\Comment;
use App\Models\Reaction;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Data;

final class CommentData extends Data
{
    public function __construct(
        public int $id,
        public string $body,
        public UserSummaryData $author,
        /** @var list<ReactionSummaryData> */
        public array $reactions,
        public CommentAbilitiesData $can,
        public CarbonInterface $createdAt,
        public ?CarbonInterface $editedAt,
    ) {}

    /** Requires user and reactions. */
    public static function fromModel(Comment $comment, User $viewer): self
    {
        $reactions = $comment->reactions
            ->groupBy(fn (Reaction $reaction): string => $reaction->emoji->value)
            ->map(fn (Collection $group): ReactionSummaryData => new ReactionSummaryData(
                emoji: $group->firstOrFail()->emoji,
                count: $group->count(),
                reacted: $group->contains('user_id', $viewer->id),
            ))
            ->values()
            ->all();

        return new self(
            id: $comment->id,
            body: $comment->body,
            author: UserSummaryData::fromModel($comment->user),
            reactions: $reactions,
            can: new CommentAbilitiesData(
                update: $viewer->can('update', $comment),
                delete: $viewer->can('delete', $comment),
            ),
            createdAt: $comment->created_at ?? now(),
            editedAt: $comment->edited_at,
        );
    }
}
