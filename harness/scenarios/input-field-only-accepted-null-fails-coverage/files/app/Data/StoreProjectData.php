<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Unique;
use StrictlyLaravel\Data\InputData;

final class StoreProjectData extends InputData
{
    public function __construct(
        #[Max(80), Unique('projects')]
        public string $name,
        #[Max(500)]
        public ?string $description,
    ) {}
}
