<?php

namespace App\Data\Issues;

use Spatie\LaravelData\Data;

final class SummaryData extends Data
{
    public function __construct(
        public int $open,
        public int $closed,
    ) {}
}
