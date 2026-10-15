<?php

namespace App\Pages\Activity;

use App\Data\Activity\ActivityData;
use App\Data\Activity\ActivityFiltersData;
use Inertia\ScrollProp;
use Spatie\LaravelData\CursorPaginatedDataCollection;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /**
         * Infinite scroll (`<InfiniteScroll data="activity">`): Inertia resolves the ScrollProp to the
         * collection, which serialises as `{ data, links, meta }`; scroll requests append to `activity.data`.
         *
         * @var ScrollProp<CursorPaginatedDataCollection<array-key, ActivityData>>
         */
        public ScrollProp $activity,
        public ActivityFiltersData $filters,
    ) {}
}
