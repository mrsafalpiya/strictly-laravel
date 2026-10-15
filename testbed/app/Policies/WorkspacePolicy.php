<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

final class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace) !== null;
    }

    /** Members, projects, labels, cycles and settings. */
    public function manage(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace)?->canManage() ?? false;
    }

    /** Create and edit issues and comments. */
    public function contribute(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace)?->canContribute() ?? false;
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $user->roleIn($workspace) === WorkspaceRole::Owner;
    }
}
