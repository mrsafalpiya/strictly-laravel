<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Broadcast;

// A workspace's live updates (new comments): every member may listen. The client names it with
// channel('workspaces.{workspace}', { workspace }) from @/generated/broadcasting.
Broadcast::channel('workspaces.{workspace}', fn (User $user, Workspace $workspace): bool => $user->can('view', $workspace));
