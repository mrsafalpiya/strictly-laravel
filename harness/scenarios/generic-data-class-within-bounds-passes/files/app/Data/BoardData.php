<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class BoardData extends Data
{
    /**
     * @param  ListingData<IssueData>  $backlog
     * @param  PageOfData<UserData, int>  $assignees
     */
    public function __construct(
        public ListingData $backlog,
        public PageOfData $assignees,
    ) {}
}
