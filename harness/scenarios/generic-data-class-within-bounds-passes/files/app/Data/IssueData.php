<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
    ) {}
}
