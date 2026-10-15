<?php

namespace App\Data\Workspaces;

use Spatie\LaravelData\Data;

final class WorkspaceNotificationSettingsData extends Data
{
    public function __construct(
        public bool $onAssign = true,
        public bool $onComment = true,
        public bool $dailyDigest = false,
    ) {}
}
