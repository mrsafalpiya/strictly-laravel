<?php

namespace App\Data;

use SplFileInfo;
use Spatie\LaravelData\Data;

final class ImportData extends Data
{
    public function __construct(
        public string $name,
        public SplFileInfo $source,
    ) {}
}
