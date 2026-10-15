<?php

namespace App\Data\Comments;

use App\Enums\Reaction;
use Spatie\LaravelData\Data;

final class ReactionSummaryData extends Data
{
    public function __construct(
        public Reaction $emoji,
        public int $count,
        /** Whether the current user is one of them. */
        public bool $reacted,
    ) {}
}
