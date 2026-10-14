<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;
use App\Models\Project;
use App\Pages\Projects\ShowPage;

final class ProjectController extends Controller
{
    public function show(Project $project): ShowPage
    {
        return new ShowPage(project: ProjectData::fromModel($project));
    }
}
