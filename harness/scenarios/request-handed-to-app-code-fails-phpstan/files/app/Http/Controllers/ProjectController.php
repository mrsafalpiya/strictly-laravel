<?php

namespace App\Http\Controllers;

use App\Actions\CreateProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ProjectController extends Controller
{
    public function store(Request $request, CreateProject $create): RedirectResponse
    {
        return to_route('dashboard', ['created' => $create->handle($request)]);
    }
}
