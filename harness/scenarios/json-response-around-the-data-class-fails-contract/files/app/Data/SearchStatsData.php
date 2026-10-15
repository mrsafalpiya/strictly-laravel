<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class SearchStatsData extends Data
{
    /**
     * @param  array{documents: int, projects: int}  $counts
     */
    public function __construct(
        public int $indexed,
        public array $counts,
    ) {}
}
