<?php

namespace App\Data\Search;

use App\Support\Data\QueryData;
use Spatie\LaravelData\Attributes\Validation\Max;

final class SearchQueryData extends QueryData
{
    public function __construct(
        #[Max(100)]
        public ?string $q = null,
    ) {}
}
