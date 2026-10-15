<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('projects.{project}', fn (User $user, Project $project): bool => $project->user_id === $user->id);
