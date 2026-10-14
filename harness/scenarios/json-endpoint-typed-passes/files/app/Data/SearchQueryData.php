<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class SearchQueryData extends InputData
{
    public function __construct(
        public string $q,
    ) {}
}
