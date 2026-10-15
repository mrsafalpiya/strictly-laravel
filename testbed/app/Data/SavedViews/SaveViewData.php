<?php

namespace App\Data\SavedViews;

use App\Data\Issues\IssueFiltersData;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;

/**
 * POST /w/{workspace}/views: the issue list's current filters, saved under a name. The nested filters are validated
 * from their types like any input (empty lists allowed, each list item checked), although IssueFiltersData is
 * otherwise parsed leniently from the query string.
 */
final class SaveViewData extends InputData
{
    public function __construct(
        #[Min(1), Max(60)]
        public string $name,
        public IssueFiltersData $filters,
    ) {}
}
