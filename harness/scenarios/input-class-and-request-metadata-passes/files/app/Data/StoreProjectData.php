<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreProjectData extends InputData
{
    public function __construct(
        public string $name,
        public bool $public,
    ) {}
}
