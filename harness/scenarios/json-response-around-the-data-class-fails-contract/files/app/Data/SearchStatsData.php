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
        // @phpstan-ignore strictly.dataShape (a cached value asserted to the shape, for its Contract to catch)
        public array $counts,
    ) {}
}
