<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
use App\Data\StoreProjectData;
use App\Enums\ToastType;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;

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
}
