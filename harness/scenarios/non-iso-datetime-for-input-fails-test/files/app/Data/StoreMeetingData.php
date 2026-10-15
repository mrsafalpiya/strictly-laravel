<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use StrictlyLaravel\Data\InputData;

final class StoreMeetingData extends InputData
{
    public function __construct(
        public string $title,
        public CarbonImmutable $startsAt,
    ) {}
}
