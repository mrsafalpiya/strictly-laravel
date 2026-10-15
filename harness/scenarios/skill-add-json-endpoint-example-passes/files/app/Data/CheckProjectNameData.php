<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;

final class CheckProjectNameData extends InputData
{
    public function __construct(
        #[Max(80)]
        public string $name,
    ) {}
}
