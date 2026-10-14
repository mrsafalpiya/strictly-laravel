<?php

namespace App\Pages;

use App\Data\IssueData;
use App\Data\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class SearchResultPage extends Page
{
    public function __construct(
        public ProjectData|IssueData $match,
    ) {}
}
