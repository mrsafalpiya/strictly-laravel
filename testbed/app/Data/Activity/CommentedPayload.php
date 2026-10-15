<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use App\Models\Comment;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\KeyOf;

final class CommentedPayload extends Data
{
    public function __construct(
        #[KeyOf(Comment::class)]
        public int $commentId,
        public string $excerpt,
        /** @var ActivityType::Commented */
        public ActivityType $type = ActivityType::Commented,
    ) {}
}
