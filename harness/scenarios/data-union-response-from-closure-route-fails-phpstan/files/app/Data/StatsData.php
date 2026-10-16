<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class StatsData extends Data
{
    public function __construct(
        public int $projects,
    ) {}
}
