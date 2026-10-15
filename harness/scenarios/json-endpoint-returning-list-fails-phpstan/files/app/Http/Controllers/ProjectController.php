<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;

final class ProjectController extends Controller
{
    /**
     * @return list<ProjectData>
     */
    public function recent(): array
    {
        return [
            new ProjectData(id: 1, name: 'Launch'),
            new ProjectData(id: 2, name: 'Roadmap'),
        ];
    }
}
