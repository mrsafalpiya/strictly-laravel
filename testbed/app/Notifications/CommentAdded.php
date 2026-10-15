<?php

namespace App\Notifications;

use App\Data\Notifications\CommentAddedNotificationPayload;
use Illuminate\Notifications\Notification;

final class CommentAdded extends Notification
{
    public function __construct(public readonly CommentAddedNotificationPayload $payload) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Stored as `notifications.data`; read back by NotificationData::payloadFor().
     *
     * @return array<array-key, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload->toArray();
    }
}
