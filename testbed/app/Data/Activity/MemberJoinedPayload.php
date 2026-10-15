<?php

namespace App\Data\Activity;

use App\Enums\ActivityType;
use App\Enums\WorkspaceRole;
use Spatie\LaravelData\Data;

final class MemberJoinedPayload extends Data
{
    public function __construct(
        public WorkspaceRole $role,
        /** @var ActivityType::MemberJoined */
        public ActivityType $type = ActivityType::MemberJoined,
    ) {}
}
