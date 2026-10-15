<?php

namespace App\Data;

use App\Enums\ProjectSort;
use StrictlyLaravel\Data\QueryData;

final class ProjectFiltersData extends QueryData
{
    public function __construct(
        public ?string $search = null,
        public ProjectSort $sort = ProjectSort::Name,
    ) {}
}
