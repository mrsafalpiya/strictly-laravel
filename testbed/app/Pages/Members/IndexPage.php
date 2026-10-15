<?php

namespace App\Pages\Members;

use App\Data\Invitations\InvitationData;
use App\Data\Invitations\StoreInvitationData;
use App\Data\Members\MemberData;
use App\Data\Members\MembersPageAbilitiesData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var array<int, MemberData> */
        public array $members,
        /** @var array<int, InvitationData>|null Pending invitations; null when the viewer can't manage members. */
        public ?array $invitations,
        public StoreInvitationData $inviteDefaults,
        public MembersPageAbilitiesData $can,
    ) {}
}
