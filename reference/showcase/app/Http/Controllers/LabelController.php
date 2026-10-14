<?php

namespace App\Http\Controllers;

use App\Data\Labels\LabelListItemData;
use App\Data\Labels\StoreLabelData;
use App\Data\Labels\UpdateLabelData;
use App\Models\Label;
use App\Models\Workspace;
use App\Pages\Labels\IndexPage;
use App\Support\Inertia\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Optional;

final class LabelController extends Controller
{
    public function index(Workspace $workspace): IndexPage
    {
        return new IndexPage(
            labels: $workspace->labels()->withCount('issues')->orderBy('name')->get()
                ->map(fn (Label $label): LabelListItemData => LabelListItemData::fromModel($label))
                ->all(),
        );
    }

    public function store(StoreLabelData $data, Workspace $workspace): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $label = $workspace->labels()->create(['name' => $data->name, 'color' => $data->color]);

        Flash::success("Created label “{$label->name}”.");

        return back();
    }

    public function update(UpdateLabelData $data, Workspace $workspace, Label $label): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $label->update(array_filter([
            'name' => $data->name,
            'color' => $data->color,
        ], fn (mixed $value): bool => ! $value instanceof Optional));

        Flash::success("Saved label “{$label->name}”.");

        return back();
    }

    public function destroy(Workspace $workspace, Label $label): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $label->delete();

        Flash::success("Deleted label “{$label->name}”.");

        return back();
    }
}
