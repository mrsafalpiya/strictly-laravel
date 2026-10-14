<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;

final class ProjectIndexData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, ProjectData>  $projects
     */
    public function __construct(
        public PaginatedDataCollection $projects,
    ) {}
}
