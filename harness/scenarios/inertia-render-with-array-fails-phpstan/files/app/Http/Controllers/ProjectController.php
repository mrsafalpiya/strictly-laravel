<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class ProjectController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('projects/show', [
            'title' => 'Tracklane',
            'openIssues' => 3,
        ]);
    }
}
