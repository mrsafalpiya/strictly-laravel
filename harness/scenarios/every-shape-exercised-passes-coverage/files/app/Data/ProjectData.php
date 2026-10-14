<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectData extends Data
{
    public function __construct(
        public string $name,
        /** The lead's name, if the project has one. */
        public ?string $lead,
    ) {}
}
