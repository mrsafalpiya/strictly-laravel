<?php

namespace App\Pages\Invitations;

use App\Data\Invitations\InvitationPreviewData;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        public InvitationPreviewData $invitation,
    ) {}
}
