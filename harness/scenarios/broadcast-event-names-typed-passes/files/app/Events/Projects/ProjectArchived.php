<?php

namespace App\Events\Projects;

use App\Data\ProjectData;
use App\Models\Project;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use StrictlyLaravel\Broadcasting\BroadcastsData;

final class ProjectArchived implements ShouldBroadcast
{
    use BroadcastsData;

    public function __construct(private readonly Project $project) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("projects.{$this->project->id}");
    }

    public function broadcastData(): ProjectData
    {
        return ProjectData::fromModel($this->project);
    }
}
