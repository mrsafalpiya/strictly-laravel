<?php

namespace App\Data\Board;

use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

/**
 * One kanban column. The board sends `list<BoardColumnData>` (one per IssueStatus, in enum order)
 * rather than a map from status to issues: a list of self-describing columns keeps the order and
 * carries the per-column counts.
 */
final class BoardColumnData extends Data
{
    public function __construct(
        public IssueStatus $status,
        /** @var list<IssueListItemData> Ordered by position; at most the board's per-column cap. */
        public array $issues,
        /** Every issue in this column, shown or not. */
        public int $total,
        /** Issues not sent because of the per-column cap (`total - issues.length`). */
        public int $hiddenCount,
    ) {}
}
