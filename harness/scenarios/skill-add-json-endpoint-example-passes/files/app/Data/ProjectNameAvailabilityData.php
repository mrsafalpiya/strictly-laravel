<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectNameAvailabilityData extends Data
{
    public function __construct(
        public bool $available,
        /** A free name to offer instead, when this one is taken. */
        public ?string $suggestion,
    ) {}
}
