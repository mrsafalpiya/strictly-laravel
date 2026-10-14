<?php

namespace App\Data\Dashboard;

use App\Support\Data\DateOnly;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/** One bar group of the throughput chart: issues created and completed in the week starting on `weekStart`. */
final class ThroughputWeekData extends Data
{
    public function __construct(
        /** Monday of the week. */
        #[DateOnly]
        public CarbonInterface $weekStart,
        public int $created,
        public int $completed,
    ) {}
}
