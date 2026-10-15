<?php

namespace App\Enums;

enum IssueSort: string
{
    case Newest = 'newest';
    case Oldest = 'oldest';
    case Priority = 'priority';
    case DueDate = 'due_date';
    case Updated = 'updated';
}
