<?php

namespace App\Http\Controllers;

use App\Data\Workspaces\DestroyWorkspaceData;
use App\Data\Workspaces\UpdateWorkspaceData;
use App\Data\Workspaces\WorkspaceSettingsAbilitiesData;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Workspaces\SettingsPage;
use App\Support\Inertia\Flash;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class WorkspaceSettingsController extends Controller
{
    public function edit(Workspace $workspace, #[CurrentUser] User $user): SettingsPage
    {
        Gate::authorize('manage', $workspace);

        return new SettingsPage(
            defaults: new UpdateWorkspaceData(name: $workspace->name, slug: $workspace->slug, settings: $workspace->settings),
            can: new WorkspaceSettingsAbilitiesData(
                update: true,
                delete: $user->can('delete', $workspace),
            ),
        );
    }

    public function update(UpdateWorkspaceData $data, Workspace $workspace): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $workspace->update([
            'name' => $data->name,
            'slug' => $data->slug,
            'settings' => $data->settings,
        ]);

        Flash::success('Workspace settings saved.');

        // The slug may have changed, so `back()` could point at a URL that no longer exists.
        return to_route('workspace.settings.edit', $workspace);
    }

    public function destroy(DestroyWorkspaceData $data, Workspace $workspace): RedirectResponse
    {
        Gate::authorize('delete', $workspace);

        // DestroyWorkspaceData::rules() already checked the typed name; this guards against misuse of the class.
        abort_unless($data->confirmName === $workspace->name, 422);

        $name = $workspace->name;
        $workspace->delete();

        Flash::success("Deleted {$name}.");

        return to_route('dashboard');
    }
}
