<?php

namespace App\Events;

use App\Data\ProjectRenamedData;
use App\Models\Project;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

#[BroadcastsOn('projects.{project}')]
final class ProjectRenamed implements ShouldBroadcast
{
    use BroadcastsData;

    public function __construct(
        private readonly Project $project,
        private readonly string $previousName,
    ) {}

    public function broadcastAs(): string
    {
        return 'project.renamed';
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("projects.{$this->project->id}");
    }

    public function broadcastData(): ProjectRenamedData
    {
        return new ProjectRenamedData(previousName: $this->previousName, name: $this->project->name);
    }
}
