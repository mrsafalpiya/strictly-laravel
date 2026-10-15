<?php

namespace App\Data\Notifications;

use App\Notifications\NotificationType;
use Carbon\CarbonInterface;
use Illuminate\Notifications\DatabaseNotification;
use Spatie\LaravelData\Data;
use UnexpectedValueException;

/**
 * One row of the notifications page. `payload` is a discriminated union on `payload.type`:
 *
 *     switch (notification.payload.type) { case 'issue_assigned': notification.payload.assignedBy ... }
 */
final class NotificationData extends Data
{
    public function __construct(
        public string $id,
        public IssueAssignedNotificationPayload|CommentAddedNotificationPayload $payload,
        public ?CarbonInterface $readAt,
        public CarbonInterface $createdAt,
    ) {}

    public static function fromModel(DatabaseNotification $notification): self
    {
        return new self(
            id: $notification->id,
            payload: self::payloadFor($notification->data),
            readAt: $notification->read_at,
            createdAt: $notification->created_at ?? now(),
        );
    }

    /**
     * Reads back what App\Notifications\*::toArray() stored.
     *
     * @param  array<array-key, mixed>  $data
     */
    public static function payloadFor(array $data): IssueAssignedNotificationPayload|CommentAddedNotificationPayload
    {
        $type = $data['type'] ?? null;

        if (! is_string($type)) {
            throw new UnexpectedValueException('Notification data has no type.');
        }

        return match (NotificationType::from($type)) {
            NotificationType::IssueAssigned => IssueAssignedNotificationPayload::from($data),
            NotificationType::CommentAdded => CommentAddedNotificationPayload::from($data),
        };
    }
}
