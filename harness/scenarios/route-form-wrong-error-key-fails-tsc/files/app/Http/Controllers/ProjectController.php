<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function index(): RedirectResponse
    {
        return to_route('dashboard');
    }

    public function store(StoreProjectData $data): RedirectResponse
    {
        return back();
    }

    public function destroy(int $project): RedirectResponse
    {
        return back();
    }
}
