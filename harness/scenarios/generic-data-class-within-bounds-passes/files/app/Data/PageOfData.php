<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * One page of any Data class, keyed by an id or a slug.
 *
 * @template TItem of Data
 * @template TKey of int|string
 */
final class PageOfData extends Data
{
    /**
     * @param  list<TItem>  $items
     * @param  list<TKey>  $keys
     */
    public function __construct(
        public array $items,
        public array $keys,
    ) {}
}
