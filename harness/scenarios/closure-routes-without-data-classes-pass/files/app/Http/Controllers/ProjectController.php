<?php

namespace App\Http\Controllers;

use App\Data\StatsData;
use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data): RedirectResponse
    {
        return to_route('dashboard', ['created' => $data->name]);
    }

    public function stats(): StatsData
    {
        return new StatsData(projects: 3);
    }
}
