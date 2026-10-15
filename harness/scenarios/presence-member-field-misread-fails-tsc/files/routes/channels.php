<?php

use App\Data\ViewerData;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// A presence channel: its callback returns what the other members see of the user.
Broadcast::channel('projects.{project}.viewers', fn (User $user, Project $project): ?ViewerData => $project->user_id === $user->id ? ViewerData::fromModel($user) : null);
