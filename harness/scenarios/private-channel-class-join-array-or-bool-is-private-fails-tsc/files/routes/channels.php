<?php

use App\Broadcasting\ProjectChannel;
use Illuminate\Support\Facades\Broadcast;

// A private channel, authorized by a channel class.
Broadcast::channel('projects.{project}', ProjectChannel::class);
