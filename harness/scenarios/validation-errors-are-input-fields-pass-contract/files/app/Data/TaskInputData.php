<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class TaskInputData extends Data
{
    public function __construct(
        public string $title,
    ) {}
}
