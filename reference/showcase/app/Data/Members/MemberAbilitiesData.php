<?php

namespace App\Data\Members;

use App\Enums\WorkspaceRole;
use App\Models\Membership;
use App\Models\User;
use Spatie\LaravelData\Data;

/**
 * What the viewer may do to one row of the members table. Also the server-side check
 * MemberController uses, so the UI and the endpoint can't disagree.
 */
final class MemberAbilitiesData extends Data
{
    public function __construct(
        public bool $updateRole,
        public bool $remove,
    ) {}

    /**
     * Managers may change roles and remove members, except: nobody changes their own role or removes
     * themselves here, only owners touch owners, and the last owner can never be demoted or removed.
     */
    public static function for(User $viewer, ?WorkspaceRole $viewerRole, Membership $membership, int $ownerCount): self
    {
        $allowed = ($viewerRole?->canManage() ?? false)
            && $membership->user_id !== $viewer->id
            && ($membership->role !== WorkspaceRole::Owner || ($viewerRole === WorkspaceRole::Owner && $ownerCount > 1));

        return new self(updateRole: $allowed, remove: $allowed);
    }
}
