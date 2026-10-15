<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectStatsData extends Data
{
    public function __construct(
        public int $total,
        public int $withoutDescription,
    ) {}
}
