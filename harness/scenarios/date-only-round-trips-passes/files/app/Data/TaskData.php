<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class TaskData extends Data
{
    public function __construct(
        public string $title,
        #[DateOnly]
        public CarbonImmutable $dueOn,
        public CarbonImmutable $createdAt,
    ) {}
}
