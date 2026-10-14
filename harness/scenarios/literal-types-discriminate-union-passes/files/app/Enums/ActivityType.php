<?php

namespace App\Enums;

enum ActivityType: string
{
    case Commented = 'commented';
    case StatusChanged = 'status_changed';
}
