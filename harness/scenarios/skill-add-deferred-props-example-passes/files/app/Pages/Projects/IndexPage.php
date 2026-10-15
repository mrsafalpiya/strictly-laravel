<?php

namespace App\Pages\Projects;

use App\Data\ProjectData;
use App\Data\ProjectStatsData;
use Inertia\ScrollProp;
use Spatie\LaravelData\CursorPaginatedDataCollection;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var ScrollProp<CursorPaginatedDataCollection<array-key, ProjectData>> */
        public ScrollProp $projects,
        public Lazy|ProjectStatsData $stats,
    ) {}
}
