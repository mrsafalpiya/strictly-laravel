<?php

namespace App\Data;

use App\Enums\ProjectStatus;
use StrictlyLaravel\Data\QueryData;

final class ProjectFiltersData extends QueryData
{
    /**
     * @param  list<ProjectStatus>  $statuses
     */
    public function __construct(
        public ?string $search = 'launch',
        public array $statuses = [ProjectStatus::Active],
    ) {}
}
