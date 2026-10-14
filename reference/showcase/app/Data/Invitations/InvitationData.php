<?php

namespace App\Data\Invitations;

use App\Data\Users\UserSummaryData;
use App\Enums\WorkspaceRole;
use App\Models\Invitation;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/** A pending invitation as listed on members/index (managers only). */
final class InvitationData extends Data
{
    public function __construct(
        public int $id,
        public string $email,
        public WorkspaceRole $role,
        public UserSummaryData $invitedBy,
        public CarbonInterface $expiresAt,
        public bool $expired,
    ) {}

    /** Requires invitedBy to be loaded. */
    public static function fromModel(Invitation $invitation): self
    {
        return new self(
            id: $invitation->id,
            email: $invitation->email,
            role: $invitation->role,
            invitedBy: UserSummaryData::fromModel($invitation->invitedBy),
            expiresAt: $invitation->expires_at,
            expired: $invitation->isExpired(),
        );
    }
}
