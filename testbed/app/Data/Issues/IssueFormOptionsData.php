<?php

namespace App\Data\Issues;

use App\Data\Cycles\CycleSummaryData;
use App\Data\Labels\LabelData;
use App\Data\Projects\ProjectSummaryData;
use App\Data\Users\UserSummaryData;
use App\Models\Cycle;
use App\Models\Label;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Spatie\LaravelData\Data;

/** Everything a picker in an issue form or filter bar can choose from. */
final class IssueFormOptionsData extends Data
{
    public function __construct(
        /** @var array<int, ProjectSummaryData> */
        public array $projects,
        /** @var array<int, UserSummaryData> */
        public array $members,
        /** @var array<int, LabelData> */
        public array $labels,
        /** @var array<int, CycleSummaryData> */
        public array $cycles,
    ) {}

    public static function forWorkspace(Workspace $workspace): self
    {
        return new self(
            projects: $workspace->projects()->active()->orderBy('name')->get()->map(fn (Project $p): ProjectSummaryData => ProjectSummaryData::fromModel($p))->all(),
            members: $workspace->members()->orderBy('name')->get()->map(fn (User $u): UserSummaryData => UserSummaryData::fromModel($u))->all(),
            labels: $workspace->labels()->orderBy('name')->get()->map(fn (Label $l): LabelData => LabelData::fromModel($l))->all(),
            cycles: $workspace->cycles()->latest('starts_on')->get()->map(fn (Cycle $c): CycleSummaryData => CycleSummaryData::fromModel($c))->all(),
        );
    }
}
