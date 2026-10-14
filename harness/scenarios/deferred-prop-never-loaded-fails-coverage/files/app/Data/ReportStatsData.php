<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ReportStatsData extends Data
{
    public function __construct(
        public int $openIssues,
        public int $closedIssues,
    ) {}
}
