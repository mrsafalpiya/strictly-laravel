<?php

namespace App\Data\Cycles;

use App\Models\Cycle;
use App\Support\Data\DateOnly;
use App\Support\Data\InputData;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Attributes\Validation\After;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use Spatie\LaravelData\Attributes\Validation\Max;

/**
 * POST /w/{workspace}/cycles and PATCH /w/{workspace}/cycles/{cycle}: both send the whole cycle.
 * Also the initial state of the create/edit forms. Overlap with other cycles is checked by the
 * controller, once the dates are known to be valid.
 */
final class CycleFormData extends InputData
{
    public function __construct(
        #[Max(100)]
        public string $name,
        #[DateOnly, DateFormat('Y-m-d')]
        public CarbonInterface $startsOn,
        #[DateOnly, DateFormat('Y-m-d'), After('startsOn')]
        public CarbonInterface $endsOn,
    ) {}

    public static function fromModel(Cycle $cycle): self
    {
        return new self(name: $cycle->name, startsOn: $cycle->starts_on, endsOn: $cycle->ends_on);
    }
}
