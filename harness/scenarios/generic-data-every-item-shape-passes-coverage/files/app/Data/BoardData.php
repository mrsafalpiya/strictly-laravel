<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * A board of columns, of any Data class.
 *
 * @template TItem of Data
 */
final class BoardData extends Data
{
    /**
     * @param  list<ListingData<TItem>>  $columns
     */
    public function __construct(
        public string $name,
        public array $columns,
    ) {}
}
