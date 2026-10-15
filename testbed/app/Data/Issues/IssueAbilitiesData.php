<?php

namespace App\Data\Issues;

use Spatie\LaravelData\Data;

final class IssueAbilitiesData extends Data
{
    public function __construct(
        public bool $update,
        public bool $delete,
        public bool $comment,
    ) {}
}
