<?php

namespace App\Data\Invitations;

use App\Data\Users\UserSummaryData;
use App\Enums\WorkspaceRole;
use App\Models\Invitation;
use App\Models\User;
use App\Models\Workspace;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\RouteKeyOf;

/** What the invitee sees at /invitations/{token} before accepting. */
final class InvitationPreviewData extends Data
{
    public function __construct(
        public string $token,
        public string $workspaceName,
        #[RouteKeyOf(Workspace::class)]
        public string $workspaceSlug,
        public UserSummaryData $invitedBy,
        public string $email,
        public WorkspaceRole $role,
        public CarbonInterface $expiresAt,
        /** @var 'pending'|'expired'|'accepted'|'wrong_email'|'already_member' Only 'pending' can be accepted. */
        public string $status,
    ) {}

    /** Requires workspace and invitedBy to be loaded. */
    public static function fromModel(Invitation $invitation, User $viewer): self
    {
        return new self(
            token: $invitation->token,
            workspaceName: $invitation->workspace->name,
            workspaceSlug: $invitation->workspace->slug,
            invitedBy: UserSummaryData::fromModel($invitation->invitedBy),
            email: $invitation->email,
            role: $invitation->role,
            expiresAt: $invitation->expires_at,
            status: self::statusFor($invitation, $viewer),
        );
    }

    /**
     * @return 'pending'|'expired'|'accepted'|'wrong_email'|'already_member'
     */
    public static function statusFor(Invitation $invitation, User $viewer): string
    {
        return match (true) {
            $viewer->roleIn($invitation->workspace) !== null => 'already_member',
            $invitation->accepted_at !== null => 'accepted',
            $invitation->isExpired() => 'expired',
            mb_strtolower($viewer->email) !== mb_strtolower($invitation->email) => 'wrong_email',
            default => 'pending',
        };
    }
}
