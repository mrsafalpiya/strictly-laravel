<?php

namespace App\Enums;

enum IssueStatus: string
{
    case Open = 'open';
    case Closed = 'closed';
}
