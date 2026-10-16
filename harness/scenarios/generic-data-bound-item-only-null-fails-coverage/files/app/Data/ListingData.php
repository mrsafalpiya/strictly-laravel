<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * One column of a board of issues.
 *
 * @template TItem of IssueData
 */
final class ListingData extends Data
{
    /**
     * @param  list<TItem>  $items
     */
    public function __construct(
        public string $column,
        public array $items,
    ) {}
}
