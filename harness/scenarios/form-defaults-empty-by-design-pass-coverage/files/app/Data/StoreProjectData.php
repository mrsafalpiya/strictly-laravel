<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

/** POST /projects, and the empty state of the form that sends it. */
final class StoreProjectData extends InputData
{
    public function __construct(
        public string $name,
        public ?string $description,
    ) {}
}
