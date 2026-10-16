<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;

final class ProjectController extends Controller
{
    public function find(int $project): ?ProjectData
    {
        return $project === 1 ? new ProjectData(id: 1, name: 'Launch') : null;
    }
}
