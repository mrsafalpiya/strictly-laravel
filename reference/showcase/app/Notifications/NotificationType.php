<?php

namespace App\Notifications;

/**
 * Discriminator of the stored notification payloads (`data.type` in the notifications table).
 * Each case has a payload class in App\Data\Notifications (see NotificationData::payloadFor()).
 */
enum NotificationType: string
{
    case IssueAssigned = 'issue_assigned';
    case CommentAdded = 'comment_added';
}
