<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;
use App\Models\Project;
use App\Pages\Projects\IndexPage;

final class ProjectController extends Controller
{
    public function index(): IndexPage
    {
        return new IndexPage(
            projects: Project::query()
                ->orderBy('name')
                ->get()
                ->map(fn (Project $project): ProjectData => ProjectData::fromModel($project))
                ->all(),
        );
    }
}
