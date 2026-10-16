<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;

final class StoreMeetingData extends InputData
{
    /**
     * @param  list<CarbonImmutable>  $reminders
     */
    public function __construct(
        public string $title,
        public CarbonImmutable $startsAt,
        public array $reminders,
        // Their own format, chosen by the app: nothing else is read.
        #[DateFormat(DATE_ATOM)]
        public Optional|CarbonImmutable $agreedAt,
        #[WithCast(DateTimeInterfaceCast::class, format: DATE_ATOM)]
        public Optional|CarbonImmutable $bookedAt,
    ) {}
}
