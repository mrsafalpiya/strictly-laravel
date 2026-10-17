<?php

namespace App\Data\Issues;

use App\Data\Labels\LabelData;
use App\Data\Projects\ProjectSummaryData;
use App\Data\Users\UserSummaryData;
use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\DateOnly;

final class IssueListItemData extends Data
{
    public function __construct(
        public int $id,
        public string $identifier,
        public int $number,
        public string $title,
        public IssueStatus $status,
        public IssuePriority $priority,
        public ?int $estimate,
        #[DateOnly]
        public ?CarbonInterface $dueOn,
        public ProjectSummaryData $project,
        public ?UserSummaryData $assignee,
        /** @var list<LabelData> */
        public array $labels,
        public int $commentsCount,
        public CarbonInterface $updatedAt,
    ) {}

    /** Requires project, assignee, labels and comments_count. */
    public static function fromModel(Issue $issue): self
    {
        return new self(
            id: $issue->id,
            identifier: $issue->identifier(),
            number: $issue->number,
            title: $issue->title,
            status: $issue->status,
            priority: $issue->priority,
            estimate: $issue->estimate,
            dueOn: $issue->due_on,
            project: ProjectSummaryData::fromModel($issue->project),
            assignee: $issue->assignee === null ? null : UserSummaryData::fromModel($issue->assignee),
            labels: $issue->labels->map(LabelData::fromModel(...))->values()->all(),
            commentsCount: $issue->comments_count ?? 0,
            updatedAt: $issue->updated_at ?? $issue->created_at ?? now(),
        );
    }
}
