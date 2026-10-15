<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\DateOnly;
use StrictlyLaravel\Data\InputData;

final class StoreMeetingData extends InputData
{
    /**
     * @param  list<CarbonImmutable>  $reminders
     */
    public function __construct(
        public string $title,
        public CarbonImmutable $startsAt,
        public ?CarbonImmutable $endsAt,
        public Optional|CarbonImmutable $remindAt,
        #[DateOnly]
        public CarbonImmutable $heldOn,
        #[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public CarbonImmutable $bookedAt,
        public array $reminders,
        // Typed by an interface: read as a CarbonImmutable.
        public CarbonInterface $confirmedAt,
        public ?DateTimeInterface $cancelledAt,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return ['startsAt' => ['after:2026-01-01']];
    }
}
