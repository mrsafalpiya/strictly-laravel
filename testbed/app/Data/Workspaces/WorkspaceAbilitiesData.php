<?php

namespace App\Data\Workspaces;

use App\Enums\WorkspaceRole;
use Spatie\LaravelData\Data;

final class WorkspaceAbilitiesData extends Data
{
    public function __construct(
        public bool $manage,
        public bool $contribute,
    ) {}

    public static function forRole(WorkspaceRole $role): self
    {
        return new self(manage: $role->canManage(), contribute: $role->canContribute());
    }
}
