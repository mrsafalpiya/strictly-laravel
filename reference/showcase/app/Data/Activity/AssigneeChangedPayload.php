<?php

namespace App\Data\Activity;

use App\Data\Users\UserSummaryData;
use App\Enums\ActivityType;
use Spatie\LaravelData\Data;

final class AssigneeChangedPayload extends Data
{
    public function __construct(
        public ?UserSummaryData $from,
        public ?UserSummaryData $to,
        /** @var ActivityType::AssigneeChanged */
        public ActivityType $type = ActivityType::AssigneeChanged,
    ) {}
}
