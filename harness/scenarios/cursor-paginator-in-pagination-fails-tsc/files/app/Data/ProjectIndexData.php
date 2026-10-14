<?php

namespace App\Data;

use Spatie\LaravelData\CursorPaginatedDataCollection;
use Spatie\LaravelData\Data;

final class ProjectIndexData extends Data
{
    /**
     * @param  CursorPaginatedDataCollection<array-key, ProjectData>  $recent
     */
    public function __construct(
        public CursorPaginatedDataCollection $recent,
    ) {}
}
