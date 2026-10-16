<?php

namespace App\Data;

use StrictlyLaravel\Data\QueryData;

final class ProjectFiltersData extends QueryData
{
    public function __construct(
        public string $sort = 'newest',
    ) {}
}
