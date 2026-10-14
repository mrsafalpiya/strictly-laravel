<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final class ProjectController extends Controller
{
    public function archive(): RedirectResponse
    {
        Inertia::flash('toast', ['kind' => 'success', 'message' => 'Project archived.']);

        return to_route('dashboard');
    }
}
