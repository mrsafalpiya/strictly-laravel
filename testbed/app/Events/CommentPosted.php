<?php

namespace App\Events;

use App\Data\Comments\CommentPostedData;
use App\Models\Workspace;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use StrictlyLaravel\Broadcasting\BroadcastsData;

/**
 * A comment was posted: every member viewing the workspace hears of it live (routes/channels.php), and an open issue
 * page reloads its thread. The payload is taken when the comment is posted, so the queued broadcast needs no queries.
 */
final class CommentPosted implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        private readonly Workspace $workspace,
        private readonly CommentPostedData $comment,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("workspaces.{$this->workspace->slug}");
    }

    public function broadcastData(): CommentPostedData
    {
        return $this->comment;
    }
}
