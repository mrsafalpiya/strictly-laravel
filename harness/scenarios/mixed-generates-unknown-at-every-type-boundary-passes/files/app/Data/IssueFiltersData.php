<?php

namespace App\Data;

use StrictlyLaravel\Data\QueryData;

/**
 * The issue board's filters: the query string of issues.index.
 */
final class IssueFiltersData extends QueryData
{
    /**
     * @param  array<string, mixed>  $customFields
     */
    public function __construct(
        public ?string $search = null,
        public array $customFields = [],
    ) {}
}
