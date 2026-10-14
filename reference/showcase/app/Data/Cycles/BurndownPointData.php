<?php

namespace App\Data\Cycles;

use App\Support\Data\DateOnly;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

final class BurndownPointData extends Data
{
    public function __construct(
        #[DateOnly]
        public CarbonInterface $date,
        /** Scope minus the issues completed by the end of that day. */
        public int $remaining,
    ) {}
}
