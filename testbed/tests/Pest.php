<?php

use App\Enums\WorkspaceRole;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use StrictlyLaravel\Testing\RecordsContracts;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Feature tests are grouped by Tracklane area (tests/Feature/<Area>), each area owning its own directory.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->use(RecordsContracts::class) // every page a feature test renders is a Contract, checked by tsc
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| Helpers every area's tests share. A helper only one area uses lives in that area's test file.
|
*/

/**
 * A workspace with one project (key TRK), and a user who is a member with the given role.
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
