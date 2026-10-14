<?php

namespace App\Data;

use App\Enums\ProjectStatus;
use Spatie\LaravelData\Data;

final class ProjectCountsData extends Data
{
    /**
     * @param  array<value-of<ProjectStatus>, int>  $projectsByStatus  only the statuses that have projects
     */
    public function __construct(
        public array $projectsByStatus,
    ) {}
}
