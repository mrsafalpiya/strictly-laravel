<?php

namespace App\Data;

use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

final class BoardData extends Data
{
    /**
     * @param  ListingData<IssueData>  $backlog
     * @param  PageOfData<UserData, int>  $assignees
     * @param  ChoiceData<IssueStatus>  $status
     */
    public function __construct(
        public ListingData $backlog,
        public PageOfData $assignees,
        public ChoiceData $status,
    ) {}
}
