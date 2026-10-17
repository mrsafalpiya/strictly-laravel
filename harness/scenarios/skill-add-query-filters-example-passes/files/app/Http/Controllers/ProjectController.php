<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;
use App\Data\ProjectFiltersData;
use App\Enums\ProjectSort;
use App\Models\Project;
use App\Pages\Projects\IndexPage;
use Illuminate\Database\Eloquent\Builder;

final class ProjectController extends Controller
{
    public function index(ProjectFiltersData $filters): IndexPage
    {
        $search = $filters->search;

        $projects = Project::query()
            ->when($search !== null, fn (Builder $query) => $query->whereLike('name', "%{$search}%"))
            ->orderBy($filters->sort === ProjectSort::Newest ? 'created_at' : 'name', $filters->sort === ProjectSort::Newest ? 'desc' : 'asc')
            ->get()
            ->map(fn (Project $project): ProjectData => ProjectData::fromModel($project))
            ->all();

        return new IndexPage(
            projects: $projects,
            filters: $filters,
        );
    }
}
