<?php

namespace App\Data\Comments;

use App\Enums\Reaction;
use App\Support\Data\InputData;

final class ToggleReactionData extends InputData
{
    public function __construct(
        public Reaction $emoji,
    ) {}
}
