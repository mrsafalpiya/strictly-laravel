<?php

namespace App\Data;

use App\Enums\ProjectSort;
use App\Enums\ProjectStatus;
use StrictlyLaravel\Data\QueryData;

final class ProjectFiltersData extends QueryData
{
    /**
     * @param  list<ProjectStatus>  $statuses
     */
    public function __construct(
        public ProjectSort $sort,
        public array $statuses = [],
    ) {}
}
