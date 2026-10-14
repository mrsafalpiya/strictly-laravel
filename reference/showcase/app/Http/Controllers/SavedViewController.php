<?php

namespace App\Http\Controllers;

use App\Data\SavedViews\SaveViewData;
use App\Models\SavedView;
use App\Models\User;
use App\Models\Workspace;
use App\Support\Inertia\Flash;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;

/** Saved views are personal: any member can save their own, only the owner can delete one. */
final class SavedViewController extends Controller
{
    public function store(SaveViewData $data, Workspace $workspace, #[CurrentUser] User $user): RedirectResponse
    {
        $workspace->savedViews()->create([
            'user_id' => $user->id,
            'name' => $data->name,
            'filters' => $data->filters,
        ]);

        Flash::success("Saved view “{$data->name}”.");

        return back();
    }

    public function destroy(Workspace $workspace, SavedView $savedView, #[CurrentUser] User $user): RedirectResponse
    {
        abort_unless($savedView->user_id === $user->id, 403);

        $savedView->delete();

        Flash::success("Deleted view “{$savedView->name}”.");

        return back();
    }
}
