<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectRenamedData extends Data
{
    public function __construct(
        public string $previousName,
        public string $name,
    ) {}
}
