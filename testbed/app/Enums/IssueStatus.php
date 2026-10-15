<?php

namespace App\Enums;

enum IssueStatus: string
{
    case Backlog = 'backlog';
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case InReview = 'in_review';
    case Done = 'done';
    case Canceled = 'canceled';

    public function isClosed(): bool
    {
        return $this === self::Done || $this === self::Canceled;
    }

    /** @return list<self> */
    public static function open(): array
    {
        return array_values(array_filter(self::cases(), fn (self $status): bool => ! $status->isClosed()));
    }
}
