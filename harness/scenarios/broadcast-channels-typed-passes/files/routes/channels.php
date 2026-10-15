<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('projects.{project}', fn (User $user, Project $project): bool => $project->user_id === $user->id);

// A presence channel: its callback returns what the other members see of the user.
Broadcast::channel('projects.{project}.viewers', fn (User $user, Project $project): array => ['id' => $user->id, 'name' => $user->name]);

Broadcast::channel('App.Models.User.{id}', fn (User $user, int $id): bool => $user->id === $id);

Broadcast::channel('announcements', fn (User $user): bool => true);
