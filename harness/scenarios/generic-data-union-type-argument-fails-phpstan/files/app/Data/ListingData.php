<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * One column of a board, of any Data class.
 *
 * @template TItem of Data
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
