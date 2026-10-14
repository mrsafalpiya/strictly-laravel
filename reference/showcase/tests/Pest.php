<?php

use App\Enums\WorkspaceRole;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Arch');

/**
 * A workspace with one project, and a user who is a member with the given role.
 *
 * @return array{0: Workspace, 1: User, 2: Project}
 */
function workspaceWith(WorkspaceRole $role = WorkspaceRole::Owner): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->members()->attach($user->id, ['role' => $role]);
    $project = Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'TRK']);

    return [$workspace, $user, $project];
}
