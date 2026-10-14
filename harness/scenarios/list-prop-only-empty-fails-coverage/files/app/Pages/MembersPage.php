<?php

namespace App\Pages;

use App\Data\MemberData;
use StrictlyLaravel\Inertia\Page;

final class MembersPage extends Page
{
    /**
     * @param  list<MemberData>  $members
     */
    public function __construct(
        public array $members,
    ) {}
}
