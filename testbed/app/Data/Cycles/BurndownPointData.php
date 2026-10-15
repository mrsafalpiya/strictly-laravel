<?php

namespace App\Data\Cycles;

use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class BurndownPointData extends Data
{
    public function __construct(
        #[DateOnly]
        public CarbonInterface $date,
        /** Scope minus the issues completed by the end of that day. */
        public int $remaining,
    ) {}
}
