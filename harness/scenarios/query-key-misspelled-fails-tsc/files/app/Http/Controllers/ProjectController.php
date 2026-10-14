<?php

namespace App\Http\Controllers;

use App\Data\ProjectFiltersData;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function index(ProjectFiltersData $filters): RedirectResponse
    {
        return to_route('dashboard');
    }
}
