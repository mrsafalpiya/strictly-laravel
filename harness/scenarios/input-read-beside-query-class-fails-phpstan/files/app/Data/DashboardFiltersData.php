<?php

namespace App\Data;

use StrictlyLaravel\Data\QueryData;

final class DashboardFiltersData extends QueryData
{
    public function __construct(
        public ?string $tab = null,
    ) {}
}
