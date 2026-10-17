<?php

namespace App\Pages\Board;

use App\Data\Board\BoardColumnData;
use App\Data\Projects\ProjectSummaryData;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        /** @var list<BoardColumnData> One per IssueStatus, in enum order. */
        public array $columns,
        /** @var list<ProjectSummaryData> Active projects, for the project filter. */
        public array $projects,
        /** The `?project=KEY` filter, null for every project. */
        public ?string $projectKey,
        /** Maximum number of issues sent per column. */
        public int $columnLimit,
    ) {}
}
