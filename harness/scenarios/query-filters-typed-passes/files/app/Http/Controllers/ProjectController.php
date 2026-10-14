<?php

namespace App\Http\Controllers;

use App\Data\ProjectFiltersData;
use App\Enums\ProjectSort;
use App\Enums\ProjectStatus;
use App\Pages\Projects\IndexPage;

final class ProjectController extends Controller
{
    private const array PROJECTS = [
        'Launch' => ProjectStatus::Active,
        'Billing' => ProjectStatus::Active,
        'Legacy' => ProjectStatus::Archived,
    ];

    public function index(ProjectFiltersData $filters): IndexPage
    {
        $projects = array_keys(array_filter(
            self::PROJECTS,
            fn (ProjectStatus $status, string $name): bool => ($filters->includeArchived || $status !== ProjectStatus::Archived)
                && ($filters->statuses === [] || in_array($status, $filters->statuses, true))
                && ($filters->search === null || str_contains(strtolower($name), strtolower($filters->search))),
            ARRAY_FILTER_USE_BOTH,
        ));

        if ($filters->sort === ProjectSort::Name) {
            sort($projects);
        }

        return new IndexPage(
            filters: $filters,
            projects: array_slice($projects, ($filters->page - 1) * 10, 10),
        );
    }
}
