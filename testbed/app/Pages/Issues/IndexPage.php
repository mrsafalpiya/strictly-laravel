<?php

namespace App\Pages\Issues;

use App\Data\Issues\IssueFiltersData;
use App\Data\Issues\IssueFormOptionsData;
use App\Data\Issues\IssueListItemData;
use Spatie\LaravelData\PaginatedDataCollection;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var PaginatedDataCollection<int, IssueListItemData> */
        public PaginatedDataCollection $issues,
        /** The query string, parsed leniently and sent back so the filter bar is typed by the same class. */
        public IssueFiltersData $filters,
        public IssueFormOptionsData $options,
    ) {}
}
