<?php

namespace App\Events;

use App\Data\ProjectData;
use App\Models\Project;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

#[BroadcastsOn('projects.{project}')]
#[BroadcastsOn('projects.{project}.viewers')]
#[BroadcastsOn('App.Models.User.{id}')]
#[BroadcastsOn('announcements')]
final class ProjectUpdated implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets;

    public function __construct(private readonly Project $project) {}

    /**
     * @return list<PresenceChannel|PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("projects.{$this->project->id}"),
            new PresenceChannel("projects.{$this->project->id}.viewers"),
            new PrivateChannel("App.Models.User.{$this->project->user_id}"),
            new PrivateChannel('announcements'),
        ];
    }

    public function broadcastData(): ProjectData
    {
        return ProjectData::fromModel($this->project);
    }
}
