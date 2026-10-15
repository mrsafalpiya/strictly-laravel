<?php

namespace App\Data\Cycles;

use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

/** A cycle's issues in one status, a Data class rather than a map of lists, so Contract Coverage checks the issues (P-084). */
final class StatusGroupData extends Data
{
    public function __construct(
        public IssueStatus $status,
        /** @var list<IssueListItemData> Empty when no issue in the cycle has the status. */
        public array $issues,
    ) {}
}
