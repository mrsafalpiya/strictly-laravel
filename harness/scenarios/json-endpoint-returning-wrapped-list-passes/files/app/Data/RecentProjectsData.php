<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class RecentProjectsData extends Data
{
    /**
     * @param  list<ProjectData>  $projects
     */
    public function __construct(
        public array $projects,
    ) {}
}
