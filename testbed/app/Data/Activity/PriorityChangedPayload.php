<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use App\Enums\IssuePriority;
use Spatie\LaravelData\Data;

final class PriorityChangedPayload extends Data
{
    public function __construct(
        public IssuePriority $from,
        public IssuePriority $to,
        /** @var ActivityType::PriorityChanged */
        public ActivityType $type = ActivityType::PriorityChanged,
    ) {}
}
