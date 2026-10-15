<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use Spatie\LaravelData\Data;

final class IssueCreatedPayload extends Data
{
    public function __construct(
        /** @var ActivityType::IssueCreated */
        public ActivityType $type = ActivityType::IssueCreated,
    ) {}
}
