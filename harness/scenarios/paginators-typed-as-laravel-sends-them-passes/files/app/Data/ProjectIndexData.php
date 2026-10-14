<?php

namespace App\Data;

use Spatie\LaravelData\CursorPaginatedDataCollection;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;

final class ProjectIndexData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, ProjectData>  $projects
     * @param  CursorPaginatedDataCollection<array-key, ProjectData>  $recent
     */
    public function __construct(
        public PaginatedDataCollection $projects,
        public CursorPaginatedDataCollection $recent,
    ) {}
}
