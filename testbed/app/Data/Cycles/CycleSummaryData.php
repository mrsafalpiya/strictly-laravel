<?php

namespace App\Data\Cycles;

use App\Models\Cycle;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class CycleSummaryData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        #[DateOnly]
        public CarbonInterface $startsOn,
        #[DateOnly]
        public CarbonInterface $endsOn,
    ) {}

    public static function fromModel(Cycle $cycle): self
    {
        return new self(id: $cycle->id, name: $cycle->name, startsOn: $cycle->starts_on, endsOn: $cycle->ends_on);
    }
}
