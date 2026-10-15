<?php

use App\Broadcasting\ProjectEditorsChannel;
use App\Data\ViewerData;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('projects.{project}', fn (User $user, Project $project): bool => $project->user_id === $user->id);

// Presence channels: each callback returns what the other members see of the user, or null to refuse them.
Broadcast::channel('projects.{project}.viewers', fn (User $user, Project $project): ?ViewerData => $project->user_id === $user->id ? ViewerData::fromModel($user) : null);

Broadcast::channel('projects.{project}.editors', ProjectEditorsChannel::class);
