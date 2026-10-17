<?php

namespace App\Http\Controllers;

use App\Data\Issues\IssueReferenceData;
use App\Data\Projects\ProjectSummaryData;
use App\Data\Search\SearchQueryData;
use App\Data\Search\SearchResultsData;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Builder;

/**
 * JSON endpoint for the command palette (not an Inertia page): the Data object is Responsable,
 * so the response body is exactly `SearchResultsData` in TypeScript.
 */
final class SearchController extends Controller
{
    private const int LIMIT = 8;

    public function __invoke(SearchQueryData $query, Workspace $workspace): SearchResultsData
    {
        $term = trim($query->q ?? '');

        if ($term === '') {
            return new SearchResultsData(issues: [], projects: []);
        }

        $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $term).'%';

        $issues = Issue::query()
            ->whereIn('project_id', $workspace->projects()->select('id'))
            ->where(function (Builder $where) use ($term, $like): void {
                $where->where('title', 'like', $like);

                // "TRK-12" (or "trk-12") jumps straight to the issue.
                if (preg_match('/^([A-Za-z][A-Za-z0-9]*)-(\d+)$/', $term, $matches) === 1) {
                    $where->orWhere(fn (Builder $identifier) => $identifier
                        ->where('number', (int) $matches[2])
                        ->whereHas('project', fn (Builder $project) => $project->where('key', strtoupper($matches[1]))));
                }
            })
            ->with('project')
            ->latest('updated_at')
            ->limit(self::LIMIT)
            ->get();

        $projects = $workspace->projects()
            ->active()
            ->where(fn (Builder $where) => $where->where('name', 'like', $like)->orWhere('key', 'like', $like))
            ->orderBy('name')
            ->limit(self::LIMIT)
            ->get();

        return new SearchResultsData(
            issues: $issues->map(fn (Issue $issue): IssueReferenceData => IssueReferenceData::fromModel($issue))->values()->all(),
            projects: $projects->map(fn (Project $project): ProjectSummaryData => ProjectSummaryData::fromModel($project))->values()->all(),
        );
    }
}
