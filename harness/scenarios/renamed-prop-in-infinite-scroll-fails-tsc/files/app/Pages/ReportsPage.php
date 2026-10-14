<?php

namespace App\Pages;

use App\Data\ReportStatsData;
use Inertia\ScrollProp;
use Spatie\LaravelData\CursorPaginatedDataCollection;
use StrictlyLaravel\Inertia\Page;

final class ReportsPage extends Page
{
    /**
     * @param  ScrollProp<CursorPaginatedDataCollection<array-key, ReportStatsData>>  $history
     */
    public function __construct(
        public string $title,
        public ScrollProp $history,
    ) {}
}
