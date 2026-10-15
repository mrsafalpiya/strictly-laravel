<?php

namespace App\Http\Controllers;

use App\Data\UpdateProjectData;
use App\Events\ProjectUpdated;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function update(UpdateProjectData $data, Project $project): RedirectResponse
    {
        $project->update(['name' => $data->name, 'description' => $data->description]);

        broadcast(new ProjectUpdated($project))->toOthers();

        return back();
    }
}
