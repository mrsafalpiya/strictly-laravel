<?php

namespace App\Pages\Board;

use App\Data\Board\BoardColumnData;
use App\Data\Projects\ProjectSummaryData;
use App\Support\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        /** @var array<int, BoardColumnData> One per IssueStatus, in enum order. */
        public array $columns,
        /** @var array<int, ProjectSummaryData> Active projects, for the project filter. */
        public array $projects,
        /** The `?project=KEY` filter, null for every project. */
        public ?string $projectKey,
        /** Maximum number of issues sent per column. */
        public int $columnLimit,
    ) {}
}
