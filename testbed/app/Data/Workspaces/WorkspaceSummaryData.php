<?php

namespace App\Data\Workspaces;

use App\Enums\WorkspaceRole;
use App\Models\Workspace;
use Spatie\LaravelData\Data;

final class WorkspaceSummaryData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public WorkspaceRole $role,
    ) {}

    public static function fromModel(Workspace $workspace, WorkspaceRole $role): self
    {
        return new self(id: $workspace->id, name: $workspace->name, slug: $workspace->slug, role: $role);
    }
}
