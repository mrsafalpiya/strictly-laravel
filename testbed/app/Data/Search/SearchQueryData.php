<?php

namespace App\Data\Search;

use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\QueryData;

final class SearchQueryData extends QueryData
{
    public function __construct(
        #[Max(100)]
        public ?string $q = null,
    ) {}
}
