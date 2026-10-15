<?php

namespace App\Enums;

enum WorkspaceRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';
    case Guest = 'guest';

    /** Can manage members, projects, labels and settings. */
    public function canManage(): bool
    {
        return $this === self::Owner || $this === self::Admin;
    }

    /** Can create and edit issues and comments. */
    public function canContribute(): bool
    {
        return $this !== self::Guest;
    }
}
