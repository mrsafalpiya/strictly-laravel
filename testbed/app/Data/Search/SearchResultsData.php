<?php

namespace App\Data\Search;

use App\Data\Issues\IssueReferenceData;
use App\Data\Projects\ProjectSummaryData;
use Spatie\LaravelData\Data;

/** Response of the JSON endpoint `GET /w/{workspace}/search?q=` (route `search`). */
final class SearchResultsData extends Data
{
    public function __construct(
        /** @var list<IssueReferenceData> */
        public array $issues,
        /** @var list<ProjectSummaryData> */
        public array $projects,
    ) {}
}
