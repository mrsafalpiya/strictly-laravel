<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Lazy;

final class ReportData extends Data
{
    public function __construct(
        public string $name,
        /** Lazy::inertiaDeferred(fn () => …): loaded after the first render. */
        public Lazy|ReportStatsData $stats,
    ) {}
}
