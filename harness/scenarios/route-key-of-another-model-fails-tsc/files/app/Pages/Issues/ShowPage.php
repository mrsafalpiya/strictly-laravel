<?php

namespace App\Pages\Issues;

use App\Data\IssueData;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        public IssueData $issue,
    ) {}
}
