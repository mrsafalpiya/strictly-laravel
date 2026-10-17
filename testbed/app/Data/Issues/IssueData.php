<?php

namespace App\Data\Issues;

use App\Data\Cycles\CycleSummaryData;
use App\Data\Labels\LabelData;
use App\Data\Projects\ProjectSummaryData;
use App\Data\Users\UserSummaryData;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class IssueData extends Data
{
    public function __construct(
        public int $id,
        public string $identifier,
        public int $number,
        public string $title,
        public ?string $description,
        public IssueStatus $status,
        public IssuePriority $priority,
        public ?int $estimate,
        #[DateOnly]
        public ?CarbonInterface $dueOn,
        public ProjectSummaryData $project,
        public UserSummaryData $reporter,
        public ?UserSummaryData $assignee,
        /** @var list<LabelData> */
        public array $labels,
        public ?CycleSummaryData $cycle,
        public ?IssueReferenceData $parent,
        /** @var list<IssueReferenceData> */
        public array $children,
        public ?CarbonInterface $completedAt,
        public CarbonInterface $createdAt,
    ) {}

    /** Requires project, reporter, assignee, labels, cycle, parent.project and children.project. */
    public static function fromModel(Issue $issue): self
    {
        return new self(
            id: $issue->id,
            identifier: $issue->identifier(),
            number: $issue->number,
            title: $issue->title,
            description: $issue->description,
            status: $issue->status,
            priority: $issue->priority,
            estimate: $issue->estimate,
            dueOn: $issue->due_on,
            project: ProjectSummaryData::fromModel($issue->project),
            reporter: UserSummaryData::fromModel($issue->reporter),
            assignee: $issue->assignee === null ? null : UserSummaryData::fromModel($issue->assignee),
            labels: $issue->labels->map(LabelData::fromModel(...))->values()->all(),
            cycle: $issue->cycle === null ? null : CycleSummaryData::fromModel($issue->cycle),
            parent: $issue->parent === null ? null : IssueReferenceData::fromModel($issue->parent),
            children: $issue->children->map(IssueReferenceData::fromModel(...))->values()->all(),
            completedAt: $issue->completed_at,
            createdAt: $issue->created_at,
        );
    }
}
