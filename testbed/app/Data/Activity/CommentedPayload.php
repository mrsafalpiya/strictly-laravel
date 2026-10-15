<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use Spatie\LaravelData\Data;

final class CommentedPayload extends Data
{
    public function __construct(
        public int $commentId,
        public string $excerpt,
        /** @var ActivityType::Commented */
        public ActivityType $type = ActivityType::Commented,
    ) {}
}
