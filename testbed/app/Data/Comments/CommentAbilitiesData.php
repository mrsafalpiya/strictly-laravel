<?php

namespace App\Data\Comments;

use Spatie\LaravelData\Data;

final class CommentAbilitiesData extends Data
{
    public function __construct(
        public bool $update,
        public bool $delete,
    ) {}
}
