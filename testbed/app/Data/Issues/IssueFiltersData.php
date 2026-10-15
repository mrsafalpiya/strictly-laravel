<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueSort;
use App\Enums\IssueStatus;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\QueryData;

/**
 * Issue list filters: the query string of issues.index (?statuses[]=todo&sort=priority), stored as
 * JSON for saved views (Eloquent cast) and sent back to the page so the filter UI is typed by the
 * same class.
 */
final class IssueFiltersData extends QueryData
{
    public function __construct(
        #[Max(100)]
        public ?string $search = null,
        /** @var list<IssueStatus> */
        public array $statuses = [],
        /** @var list<IssuePriority> */
        public array $priorities = [],
        /** @var list<int> */
        public array $labelIds = [],
        public ?int $assigneeId = null,
        public ?string $projectKey = null,
        public IssueSort $sort = IssueSort::Newest,
        public bool $includeClosed = false,
    ) {}
}
