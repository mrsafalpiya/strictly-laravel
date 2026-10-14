<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Data\Activity\StatusChangedPayload;
use App\Data\Board\BoardColumnData;
use App\Data\Board\BoardQueryData;
use App\Data\Board\MoveIssueData;
use App\Data\Issues\IssueListItemData;
use App\Data\Projects\ProjectSummaryData;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Board\ShowPage;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

final class BoardController extends Controller
{
    /** Issues sent per column; the rest are only counted. */
    public const int COLUMN_LIMIT = 50;

    public function __construct(private readonly RecordActivity $recordActivity) {}

    public function show(BoardQueryData $query, Workspace $workspace): ShowPage
    {
        $projects = $workspace->projects()->active()->orderBy('name')->get();
        $project = $query->project === null ? null : $projects->firstWhere('key', $query->project);

        $columns = [];

        foreach (IssueStatus::cases() as $status) {
            $issues = $this->issues($workspace, $project)
                ->where('status', $status)
                ->with(['project', 'assignee', 'labels'])
                ->withCount('comments')
                ->orderBy('position')
                ->orderBy('id')
                ->limit(self::COLUMN_LIMIT)
                ->get()
                ->map(fn (Issue $issue): IssueListItemData => IssueListItemData::fromModel($issue))
                ->values()
                ->all();

            $total = $this->issues($workspace, $project)->where('status', $status)->count();

            $columns[] = new BoardColumnData(
                status: $status,
                issues: $issues,
                total: $total,
                hiddenCount: max(0, $total - count($issues)),
            );
        }

        return new ShowPage(
            columns: $columns,
            projects: $projects->map(fn (Project $project): ProjectSummaryData => ProjectSummaryData::fromModel($project))->values()->all(),
            projectKey: $project?->key,
            columnLimit: self::COLUMN_LIMIT,
        );
    }

    public function move(MoveIssueData $data, Workspace $workspace, Project $project, Issue $issue, #[CurrentUser] User $user): RedirectResponse
    {
        Gate::authorize('update', $issue);

        $issue->setRelation('project', $project);
        $from = $issue->status;

        DB::transaction(function () use ($data, $project, $issue): void {
            // The target column within the issue's own project, without the issue itself.
            $ids = $project->issues()
                ->where('status', $data->status)
                ->whereKeyNot($issue->id)
                ->orderBy('position')
                ->orderBy('id')
                ->get(['id'])
                ->map(fn (Issue $other): int => $other->id)
                ->values()
                ->all();

            $index = $this->targetIndex($ids, $data);
            array_splice($ids, $index, 0, [$issue->id]);

            $issue->update([
                'status' => $data->status,
                'position' => $index,
                'completed_at' => $data->status->isClosed() ? ($issue->completed_at ?? now()) : null,
            ]);

            foreach ($ids as $position => $id) {
                if ($id !== $issue->id) {
                    Issue::query()->whereKey($id)->where('position', '!=', $position)->update(['position' => $position]);
                }
            }
        });

        if ($from !== $data->status) {
            $this->recordActivity->handle($workspace, $user, $issue, new StatusChangedPayload(from: $from, to: $data->status));
        }

        return back();
    }

    /**
     * Where to insert the moved issue among the other issues of the column: next to a known
     * neighbour if possible, else at the requested index (clamped).
     *
     * @param  array<int, int>  $ids
     */
    private function targetIndex(array $ids, MoveIssueData $data): int
    {
        if ($data->beforeId !== null && ($index = array_search($data->beforeId, $ids, true)) !== false) {
            return $index;
        }

        if ($data->afterId !== null && ($index = array_search($data->afterId, $ids, true)) !== false) {
            return $index + 1;
        }

        return min($data->position, count($ids));
    }

    /**
     * @return Builder<Issue>
     */
    private function issues(Workspace $workspace, ?Project $project): Builder
    {
        return $project === null
            ? Issue::query()->whereIn('project_id', $workspace->projects()->active()->select('id'))
            : Issue::query()->whereBelongsTo($project);
    }
}
