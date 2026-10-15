<?php

namespace App\Data\Cycles;

use App\Models\Cycle;
use App\Support\Workspaces\CurrentWorkspace;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\After;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\DateOnly;
use StrictlyLaravel\Data\InputData;

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

    /** Runs before validation, so a viewer who can't manage the workspace gets a 403, not the fields' errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('manage', $current->workspace());
    }

    public static function fromModel(Cycle $cycle): self
    {
        return new self(name: $cycle->name, startsOn: $cycle->starts_on, endsOn: $cycle->ends_on);
    }
}
