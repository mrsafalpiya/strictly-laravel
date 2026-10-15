<?php

namespace App\Broadcasting;

use App\Data\ViewerData;
use App\Models\Project;
use App\Models\User;

final class ProjectEditorsChannel
{
    public function join(User $user, Project $project): ?ViewerData
    {
        return $project->user_id === $user->id ? ViewerData::fromModel($user) : null;
    }
}
