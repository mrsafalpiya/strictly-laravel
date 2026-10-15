<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
use App\Data\Projects\ProjectData;
use App\Data\Projects\ProjectFormOptionsData;
use App\Data\Projects\ProjectIndexQueryData;
use App\Data\Projects\StoreProjectData;
use App\Data\Projects\UpdateProjectData;
use App\Enums\Color;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Workspace;
use App\Pages\Projects\CreatePage;
use App\Pages\Projects\EditPage;
use App\Pages\Projects\IndexPage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class ProjectController extends Controller
{
    public function index(ProjectIndexQueryData $query, Workspace $workspace): IndexPage
    {
        $showArchived = $query->archived;

        $projects = $workspace->projects()
            ->with('lead')
            ->withCount('issues')
            ->when(! $showArchived, fn (Builder $query) => $query->whereNull('archived_at'))
            ->orderByRaw('archived_at is not null')
            ->orderBy('name')
            ->get();

        $counts = $this->openIssueCounts($projects->modelKeys());

        return new IndexPage(
            projects: $projects
                ->map(fn (Project $project): ProjectData => ProjectData::fromModel($project, $counts[$project->id]))
                ->all(),
            showArchived: $showArchived,
            archivedCount: $workspace->projects()->whereNotNull('archived_at')->count(),
        );
    }

    public function create(Workspace $workspace): CreatePage
    {
        Gate::authorize('manage', $workspace);

        return new CreatePage(
            defaults: new StoreProjectData(key: '', name: '', description: null, color: Color::Blue, leadId: null),
            options: ProjectFormOptionsData::forWorkspace($workspace),
        );
    }

    public function store(StoreProjectData $data, Workspace $workspace): RedirectResponse
    {
        $project = $workspace->projects()->create([
            'key' => $data->key,
            'name' => $data->name,
            'description' => $data->description,
            'color' => $data->color,
            'lead_id' => $data->leadId,
        ]);

        FlashData::success("Created {$project->key} · {$project->name}.");

        return to_route('projects.index', $workspace);
    }

    public function edit(Workspace $workspace, Project $project): EditPage
    {
        Gate::authorize('manage', $workspace);

        $project->load('lead')->loadCount('issues');

        return new EditPage(
            project: ProjectData::fromModel($project, $this->openIssueCounts([$project->id])[$project->id]),
            defaults: UpdateProjectData::fromModel($project),
            options: ProjectFormOptionsData::forWorkspace($workspace),
        );
    }

    public function update(UpdateProjectData $data, Workspace $workspace, Project $project): RedirectResponse
    {
        $project->update([
            'name' => $data->name,
            'description' => $data->description,
            'color' => $data->color,
            'lead_id' => $data->leadId,
        ]);

        FlashData::success("Saved {$project->key}.");

        return to_route('projects.index', $workspace);
    }

    /** Toggles the archived state. */
    public function archive(Workspace $workspace, Project $project): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $archiving = $project->archived_at === null;
        $project->update(['archived_at' => $archiving ? now() : null]);

        FlashData::success($archiving ? "Archived {$project->key}." : "Restored {$project->key}.");

        return back();
    }

    /**
     * Only empty projects can be deleted: issues are archived with their project instead.
     * Refuses (with an error toast) when the project still has issues.
     */
    public function destroy(Workspace $workspace, Project $project): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        if ($project->issues()->exists()) {
            FlashData::error("{$project->key} still has issues. Archive it instead, or move its issues first.");

            return back();
        }

        $project->delete();

        FlashData::success("Deleted {$project->key}.");

        return to_route('projects.index', $workspace);
    }

    /**
     * Open issue counts per project, with every open status present (0 when empty).
     *
     * @param  array<int, int>  $projectIds
     * @return array<int, array<value-of<IssueStatus>, int>>
     */
    private function openIssueCounts(array $projectIds): array
    {
        $empty = [];

        foreach (IssueStatus::open() as $status) {
            $empty[$status->value] = 0;
        }

        $counts = array_fill_keys($projectIds, $empty);

        $rows = Issue::query()
            ->select(['project_id', 'status'])
            ->selectRaw('count(*) as aggregate')
            ->whereIn('project_id', $projectIds)
            ->whereIn('status', IssueStatus::open())
            ->groupBy('project_id', 'status')
            ->get();

        foreach ($rows as $row) {
            $aggregate = $row->getAttribute('aggregate');
            $counts[$row->project_id][$row->status->value] = is_numeric($aggregate) ? (int) $aggregate : 0;
        }

        return $counts;
    }
}
