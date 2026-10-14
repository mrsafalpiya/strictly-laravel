<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data): RedirectResponse
    {
        Gate::authorize('create-projects');

        return back();
    }
}
