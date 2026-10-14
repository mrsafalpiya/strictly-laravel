<?php

namespace App\Pages\Projects;

use App\Data\IssueData;
use App\Data\MemberData;
use App\Data\MilestoneData;
use App\Data\ProjectData;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    /**
     * @param  list<MemberData>  $members
     */
    public function __construct(
        public ProjectData $project,
        public array $members,
        /** What the project works on next. */
        public IssueData|MilestoneData $focus,
        /** Story points, or a label such as "unknown". */
        public int|string $estimate,
        /** Sent only to members. */
        public int|Optional $openIssues,
    ) {}
}
