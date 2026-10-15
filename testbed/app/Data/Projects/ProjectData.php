<?php

namespace App\Data\Projects;

use App\Data\Users\UserSummaryData;
use App\Enums\Color;
use App\Enums\IssueStatus;
use App\Models\Project;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/** A project card on the projects index, and the read-only header of the edit page. */
final class ProjectData extends Data
{
    public function __construct(
        public int $id,
        public string $key,
        public string $name,
        public ?string $description,
        public Color $color,
        public ?UserSummaryData $lead,
        public ?CarbonInterface $archivedAt,
        public int $issuesCount,
        /**
         * Open issues per open status. Every open status is present (0 when empty), closed
         * statuses never are, so TypeScript gets a partial map. Never empty: an empty PHP array
         * would serialise as a JSON `[]`, not `{}`.
         *
         * @var array<value-of<IssueStatus>, int>
         */
        public array $openIssueCounts,
    ) {}

    /**
     * Requires lead and issues_count.
     *
     * @param  array<value-of<IssueStatus>, int>  $openIssueCounts
     */
    public static function fromModel(Project $project, array $openIssueCounts): self
    {
        return new self(
            id: $project->id,
            key: $project->key,
            name: $project->name,
            description: $project->description,
            color: $project->color,
            lead: $project->lead === null ? null : UserSummaryData::fromModel($project->lead),
            archivedAt: $project->archived_at,
            issuesCount: $project->issues_count ?? 0,
            openIssueCounts: $openIssueCounts,
        );
    }
}
