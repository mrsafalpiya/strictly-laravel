<?php

namespace App\Pages\Cycles;

use App\Data\Cycles\CycleData;
use App\Data\Cycles\CycleFormData;
use App\Data\Cycles\CycleStatsData;
use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use App\Support\Inertia\Page;
use Spatie\LaravelData\Lazy;

final class ShowPage extends Page
{
    public function __construct(
        public CycleData $cycle,
        /** @var array<value-of<IssueStatus>, array<int, IssueListItemData>> Every status is present (empty list when none). */
        public array $issuesByStatus,
        /** Deferred: loaded right after the first paint. */
        public Lazy|CycleStatsData $stats,
        /** Initial state of the edit form. */
        public CycleFormData $defaults,
    ) {}
}
