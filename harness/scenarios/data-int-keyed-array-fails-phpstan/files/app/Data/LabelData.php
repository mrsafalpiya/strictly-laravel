<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class LabelData extends Data
{
    public function __construct(
        public string $name,
    ) {}
}
