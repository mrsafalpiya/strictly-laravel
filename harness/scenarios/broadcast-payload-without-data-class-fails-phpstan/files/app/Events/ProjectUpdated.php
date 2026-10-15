<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

final class ProjectUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        private readonly int $projectId,
        private readonly string $name,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("projects.{$this->projectId}");
    }

    /**
     * A payload typed by hand on the client, which nothing keeps in step with these keys.
     *
     * @return array{id: int, name: string}
     */
    public function broadcastWith(): array
    {
        return ['id' => $this->projectId, 'name' => $this->name];
    }
}
