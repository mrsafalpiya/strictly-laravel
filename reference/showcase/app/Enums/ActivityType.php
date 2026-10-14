<?php

namespace App\Enums;

/** Each case has a matching payload class in App\Data\Activity (see ActivityPayload). */
enum ActivityType: string
{
    case IssueCreated = 'issue_created';
    case StatusChanged = 'status_changed';
    case PriorityChanged = 'priority_changed';
    case AssigneeChanged = 'assignee_changed';
    case Commented = 'commented';
    case MemberJoined = 'member_joined';
}
