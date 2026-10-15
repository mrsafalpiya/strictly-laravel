<?php

namespace App\Pages\Issues;

use App\Data\IssueData;
use App\Data\MemberData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var list<IssueData> */
        public array $issues,
        /** @var list<MemberData> */
        public array $members,
    ) {}
}
