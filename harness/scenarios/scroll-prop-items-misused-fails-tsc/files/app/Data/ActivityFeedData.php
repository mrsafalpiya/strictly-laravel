<?php

namespace App\Data;

use Inertia\ScrollProp;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;

final class ActivityFeedData extends Data
{
    /**
     * @param  ScrollProp<PaginatedDataCollection<int, ActivityData>>  $activities
     */
    public function __construct(
        public ScrollProp $activities,
    ) {}
}
