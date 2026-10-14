<?php

namespace App\Data\Cycles;

use App\Models\Cycle;
use App\Support\Data\DateOnly;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/** A cycle on the cycles index and the header of the cycle page. */
final class CycleData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        #[DateOnly]
        public CarbonInterface $startsOn,
        #[DateOnly]
        public CarbonInterface $endsOn,
        public int $issuesCount,
        public int $completedIssuesCount,
    ) {}

    /** Requires issues_count and completed_issues_count (see CycleController::issueCounts()). */
    public static function fromModel(Cycle $cycle): self
    {
        // Custom withCount() aliases are unknown to Larastan (only `{relation}_count` is): read them untyped.
        $completed = $cycle->getAttribute('completed_issues_count');

        return new self(
            id: $cycle->id,
            name: $cycle->name,
            startsOn: $cycle->starts_on,
            endsOn: $cycle->ends_on,
            issuesCount: $cycle->issues_count ?? 0,
            completedIssuesCount: is_numeric($completed) ? (int) $completed : 0,
        );
    }
}
