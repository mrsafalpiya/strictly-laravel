<?php

namespace App\Http\Controllers;

use App\Data\CheckProjectNameData;
use App\Data\ProjectNameAvailabilityData;
use App\Models\Project;

final class ProjectController extends Controller
{
    public function checkName(CheckProjectNameData $data): ProjectNameAvailabilityData
    {
        if (! Project::query()->where('name', $data->name)->exists()) {
            return new ProjectNameAvailabilityData(available: true, suggestion: null);
        }

        $suffix = 2;

        while (Project::query()->where('name', "{$data->name} {$suffix}")->exists()) {
            $suffix++;
        }

        return new ProjectNameAvailabilityData(available: false, suggestion: "{$data->name} {$suffix}");
    }
}
