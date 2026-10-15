<?php

namespace App\Events;

use App\Data\ProjectData;
use App\Models\Project;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

#[BroadcastsOn('status')]
#[BroadcastsOn('projects.{project}.public')]
final class ProjectUpdated implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets;

    public function __construct(private readonly Project $project) {}

    public function broadcastOn(): Channel
    {
        // config/strictly.php declares the public channel status: nothing listens on this one.
        return new Channel('statuss');
    }

    public function broadcastData(): ProjectData
    {
        return ProjectData::fromModel($this->project);
    }
}
