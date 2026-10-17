<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;

/**
 * A change to some of a project's fields: a field left out keeps its value.
 */
final class UpdateProjectData extends InputData
{
    public function __construct(
        #[Max(80)]
        public Optional|string $name = new Optional,
        #[Max(500)]
        public Optional|string|null $description = new Optional,
    ) {}
}
