<?php

namespace App\Pages;

use App\Data\IssueData;
use App\Data\ListingData;
use App\Data\MilestoneData;
use StrictlyLaravel\Inertia\Page;

final class BacklogPage extends Page
{
    /**
     * @param  ListingData<IssueData|MilestoneData>  $backlog
     */
    public function __construct(
        public ListingData $backlog,
    ) {}
}
