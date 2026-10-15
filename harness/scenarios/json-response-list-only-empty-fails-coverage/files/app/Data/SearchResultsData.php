<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class SearchResultsData extends Data
{
    /**
     * @param  list<SearchHitData>  $hits
     */
    public function __construct(
        public string $query,
        public array $hits,
    ) {}
}
