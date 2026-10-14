<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ActivityData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
    ) {}
}
