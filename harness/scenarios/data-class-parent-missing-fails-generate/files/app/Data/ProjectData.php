<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectData extends Dat
{
    public function __construct(
        public string $name,
        public int $openIssues,
    ) {}
}
