<?php

namespace App\Pages\Cycles;

use App\Data\Cycles\CycleData;
use App\Data\Cycles\CycleFormData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** The cycle that contains today, if any (cycles never overlap, so there is at most one). */
        public ?CycleData $current,
        /** @var list<CycleData> Starting after today, soonest first. */
        public array $upcoming,
        /** @var list<CycleData> Ended before today, most recent first. */
        public array $past,
        /** Initial state of the "new cycle" form: the two weeks after the last cycle. */
        public CycleFormData $defaults,
    ) {}
}
