<?php

namespace App\Data\Workspaces;

use Spatie\LaravelData\Data;

final class WorkspaceSettingsAbilitiesData extends Data
{
    public function __construct(
        public bool $update,
        public bool $delete,
    ) {}
}
