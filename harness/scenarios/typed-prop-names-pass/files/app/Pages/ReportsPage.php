<?php

namespace App\Pages;

use App\Data\MemberData;
use App\Data\ReportStatsData;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class ReportsPage extends Page
{
    /**
     * @param  list<MemberData>  $members  shown with infinite scroll
     */
    public function __construct(
        public string $title,
        public int $stars,
        /** Lazy::inertiaDeferred(fn () => …): loaded after the first render. */
        public Lazy|ReportStatsData $stats,
        public array $members,
    ) {}
}
