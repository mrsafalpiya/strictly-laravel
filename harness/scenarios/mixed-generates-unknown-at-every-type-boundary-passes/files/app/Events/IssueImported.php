<?php

namespace App\Events;

use App\Data\IssueData;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

#[BroadcastsOn('imports')]
final class IssueImported implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets;

    public function __construct(private readonly IssueData $issue) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('imports');
    }

    public function broadcastData(): IssueData
    {
        return $this->issue;
    }
}
