<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class SearchStatsData extends Data
{
    public function __construct(
        public int $indexed,
    ) {}
}
