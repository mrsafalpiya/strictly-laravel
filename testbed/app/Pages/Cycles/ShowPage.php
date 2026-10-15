<?php

namespace App\Pages\Cycles;

use App\Data\Cycles\CycleData;
use App\Data\Cycles\CycleFormData;
use App\Data\Cycles\CycleStatsData;
use App\Data\Cycles\StatusGroupData;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        public CycleData $cycle,
        /** @var list<StatusGroupData> One group per status, in the statuses' order, empty when no issue has it. */
        public array $statusGroups,
        /** Deferred: loaded right after the first paint. */
        public Lazy|CycleStatsData $stats,
        /** Initial state of the edit form. */
        public CycleFormData $defaults,
    ) {}
}
