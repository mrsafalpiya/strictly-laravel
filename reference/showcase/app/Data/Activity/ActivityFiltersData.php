<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use App\Support\Data\QueryData;

/** Activity feed filters (`?types[]=commented&types[]=status_changed`); empty means every type. */
final class ActivityFiltersData extends QueryData
{
    public function __construct(
        /** @var list<ActivityType> */
        public array $types = [],
    ) {}
}
