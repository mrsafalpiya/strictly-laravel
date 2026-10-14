<?php

namespace App\Pages;

use App\Data\ReportStatsData;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class ReportsPage extends Page
{
    public function __construct(
        public string $title,
        /** Lazy::inertiaDeferred(fn () => …): loaded after the first render. */
        public Lazy|ReportStatsData $stats,
    ) {}
}
