<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public int $number,
        public string $title,
        public ?string $assignee,
    ) {}
}
