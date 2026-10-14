<?php

namespace Tests\Feature\Collaboration;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

/** workspaceWith() creates a single user; collaboration tests need several. */
final class Members
{
    public static function add(Workspace $workspace, WorkspaceRole $role = WorkspaceRole::Member): User
    {
        $user = User::factory()->create();
        $workspace->members()->attach($user->id, ['role' => $role]);

        return $user;
    }
}
