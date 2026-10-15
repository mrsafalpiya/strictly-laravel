<?php

namespace App\Support\Workspaces;

use App\Enums\WorkspaceRole;
use App\Models\Workspace;
use LogicException;

/**
 * The workspace in the current URL (/w/{workspace}/...) and the user's role in it.
 * Set by the EnsureWorkspaceMember middleware; scoped to one request.
 */
final class CurrentWorkspace
{
    private ?Workspace $workspace = null;

    private ?WorkspaceRole $role = null;

    public function set(Workspace $workspace, WorkspaceRole $role): void
    {
        $this->workspace = $workspace;
        $this->role = $role;
    }

    public function has(): bool
    {
        return $this->workspace !== null;
    }

    public function workspace(): Workspace
    {
        return $this->workspace ?? throw new LogicException('No current workspace: is the route inside the workspace group?');
    }

    public function role(): WorkspaceRole
    {
        return $this->role ?? throw new LogicException('No current workspace: is the route inside the workspace group?');
    }
}
