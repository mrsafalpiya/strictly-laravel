<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
use App\Data\StoreProjectData;
use App\Data\UpdateProjectData;
use App\Enums\ToastType;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Spatie\LaravelData\Optional;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data): RedirectResponse
    {
        Project::query()->create([
            'name' => $data->name,
            'description' => $data->description,
        ]);

        FlashData::toast(ToastType::Success, 'Project created.');

        return back();
    }

    public function update(Project $project, UpdateProjectData $data): RedirectResponse
    {
        $project->update(array_filter([
            'name' => $data->name,
            'description' => $data->description,
        ], fn (mixed $value): bool => ! $value instanceof Optional));

        return back();
    }
}
