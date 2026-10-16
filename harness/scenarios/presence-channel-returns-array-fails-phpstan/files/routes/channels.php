<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('projects.{project}', fn (User $user, Project $project): bool => $project->user_id === $user->id);

// A presence channel whose members' data is an array, which nothing types.
Broadcast::channel('projects.{project}.viewers', fn (User $user, Project $project): array => ['id' => $user->id, 'name' => $user->name]);
