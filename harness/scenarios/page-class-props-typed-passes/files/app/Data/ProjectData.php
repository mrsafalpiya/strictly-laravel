<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectData extends Data
{
    public function __construct(
        public string $name,
        public int $openIssues,
    ) {}
}
