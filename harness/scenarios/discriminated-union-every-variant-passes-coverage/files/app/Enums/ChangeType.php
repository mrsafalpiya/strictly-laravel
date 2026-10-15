<?php

namespace App\Enums;

/** The discriminator of the change union. */
enum ChangeType: string
{
    case Status = 'status';
    case Priority = 'priority';
}
