<?php

namespace App\Events;

use App\Data\ProjectData;
use App\Models\Project;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

// Declares only the project's channel, but broadcastOn() also sends it to the owner's.
#[BroadcastsOn('projects.{project}')]
final class ProjectUpdated implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets;

    public function __construct(private readonly Project $project) {}

    /** @return list<PrivateChannel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("projects.{$this->project->id}"),
            new PrivateChannel("App.Models.User.{$this->project->user_id}"),
        ];
    }

    public function broadcastData(): ProjectData
    {
        return ProjectData::fromModel($this->project);
    }
}
