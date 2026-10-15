<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
use App\Data\Workspaces\StoreWorkspaceData;
use App\Data\Workspaces\WorkspaceSettingsData;
use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Workspaces\CreatePage;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

final class WorkspaceController extends Controller
{
    public function create(): CreatePage
    {
        return new CreatePage(defaults: new StoreWorkspaceData(name: '', slug: ''));
    }

    public function store(StoreWorkspaceData $data, #[CurrentUser] User $user): RedirectResponse
    {
        $workspace = DB::transaction(function () use ($data, $user): Workspace {
            $workspace = Workspace::create([
                'name' => $data->name,
                'slug' => $data->slug,
                'owner_id' => $user->id,
                'settings' => new WorkspaceSettingsData,
            ]);
            $workspace->memberships()->create(['user_id' => $user->id, 'role' => WorkspaceRole::Owner]);

            return $workspace;
        });

        $user->forceFill(['current_workspace_id' => $workspace->id])->save();
        FlashData::success("Created {$workspace->name}.");

        return to_route('workspace.dashboard', $workspace);
    }
}
