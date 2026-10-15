<?php

namespace App\Events;

use App\Data\InvoicePaidData;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use StrictlyLaravel\Broadcasting\BroadcastsData;
use StrictlyLaravel\Broadcasting\BroadcastsOn;

/**
 * Broadcast alongside the InvoicePaid notification, so React reads a typed payload instead of the notification's.
 */
#[BroadcastsOn('App.Models.User.{id}')]
final class InvoicePaid implements ShouldBroadcast
{
    use BroadcastsData, Dispatchable, InteractsWithSockets;

    public function __construct(private readonly User $user, private readonly string $title) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("App.Models.User.{$this->user->id}");
    }

    public function broadcastData(): InvoicePaidData
    {
        return new InvoicePaidData(title: $this->title);
    }
}
