<?php

namespace App\Http\Controllers;

use App\Data\ProjectFiltersData;
use App\Enums\ProjectSort;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function index(ProjectFiltersData $filters): RedirectResponse
    {
        return $filters->sort === ProjectSort::Name && $filters->page > 1
            ? to_route('projects.archive')
            : to_route('dashboard');
    }

    public function archive(): RedirectResponse
    {
        return to_route('dashboard');
    }
}
