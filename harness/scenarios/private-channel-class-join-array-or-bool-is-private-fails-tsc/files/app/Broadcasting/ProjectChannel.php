<?php

namespace App\Broadcasting;

use App\Models\Project;
use App\Models\User;

// As `php artisan make:channel ProjectChannel` writes it: `array|bool` authorizes a private or a presence channel alike.
final class ProjectChannel
{
    public function join(User $user, Project $project): array|bool
    {
        return $project->user_id === $user->id;
    }
}
