<?php

namespace App\Data\Members;

use App\Data\Users\UserSummaryData;
use App\Enums\WorkspaceRole;
use App\Models\Membership;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/** One row of the members table. `id` is the membership id (the {membership} route key). */
final class MemberData extends Data
{
    public function __construct(
        public int $id,
        public UserSummaryData $user,
        public string $email,
        public WorkspaceRole $role,
        public bool $isViewer,
        /** Null only for rows written without timestamps (memberships.created_at is nullable). */
        public CarbonInterface $joinedAt,
        public MemberAbilitiesData $can,
    ) {}

    /** Requires user to be loaded. */
    public static function fromModel(Membership $membership, bool $isViewer, MemberAbilitiesData $can): self
    {
        return new self(
            id: $membership->id,
            user: UserSummaryData::fromModel($membership->user),
            email: $membership->user->email,
            role: $membership->role,
            isViewer: $isViewer,
            joinedAt: $membership->created_at,
            can: $can,
        );
    }
}
