<?php

namespace App\Data;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class TaskData extends Data
{
    public function __construct(
        public string $title,
        #[DateOnly]
        public CarbonImmutable $dueOn,
        #[DateOnly]
        public Carbon $startsOn,
        public CarbonImmutable $createdAt,
    ) {}
}
