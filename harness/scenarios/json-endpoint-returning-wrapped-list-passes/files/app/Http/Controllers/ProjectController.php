<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;
use App\Data\RecentProjectsData;

final class ProjectController extends Controller
{
    public function recent(): RecentProjectsData
    {
        return new RecentProjectsData(projects: [
            new ProjectData(id: 1, name: 'Launch'),
            new ProjectData(id: 2, name: 'Roadmap'),
        ]);
    }
}
