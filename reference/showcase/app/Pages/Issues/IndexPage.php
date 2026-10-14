<?php

namespace App\Pages\Issues;

use App\Data\Issues\IssueFiltersData;
use App\Data\Issues\IssueFormOptionsData;
use App\Data\Issues\IssueListItemData;
use App\Data\SavedViews\SavedViewData;
use App\Support\Inertia\Page;
use Spatie\LaravelData\PaginatedDataCollection;

final class IndexPage extends Page
{
    public function __construct(
        /** @var PaginatedDataCollection<int, IssueListItemData> */
        public PaginatedDataCollection $issues,
        public IssueFiltersData $filters,
        public IssueFormOptionsData $options,
        /** @var array<int, SavedViewData> */
        public array $savedViews,
    ) {}
}
