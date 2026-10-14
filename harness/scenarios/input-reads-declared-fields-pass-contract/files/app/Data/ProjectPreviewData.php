<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectPreviewData extends Data
{
    public function __construct(
        public string $name,
        public int $members,
        public bool $moreRecent,
    ) {}
}
