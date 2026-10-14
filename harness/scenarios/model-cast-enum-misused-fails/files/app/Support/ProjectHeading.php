<?php

namespace App\Support;

use App\Models\Project;

final class ProjectHeading
{
    public static function for(Project $project): string
    {
        return strtoupper($project->status);
    }
}
