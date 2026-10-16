<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use StrictlyLaravel\Data\InputData;

final class StoreMeetingData extends InputData
{
    public function __construct(
        public string $title,
        #[DateFormat(DATE_ATOM)]
        public CarbonImmutable $startsAt,
    ) {}
}
