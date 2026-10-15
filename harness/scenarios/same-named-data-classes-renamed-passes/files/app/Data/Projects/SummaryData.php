<?php

namespace App\Data\Projects;

use Spatie\LaravelData\Data;

final class SummaryData extends Data
{
    public function __construct(
        public string $name,
        public int $members,
    ) {}
}
