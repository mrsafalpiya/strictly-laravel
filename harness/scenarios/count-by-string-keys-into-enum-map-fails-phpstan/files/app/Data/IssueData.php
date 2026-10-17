<?php

namespace App\Data;

use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public string $title,
        public IssueStatus $status,
    ) {}
}
