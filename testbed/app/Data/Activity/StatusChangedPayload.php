<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

final class StatusChangedPayload extends Data
{
    public function __construct(
        public IssueStatus $from,
        public IssueStatus $to,
        /** @var ActivityType::StatusChanged */
        public ActivityType $type = ActivityType::StatusChanged,
    ) {}
}
