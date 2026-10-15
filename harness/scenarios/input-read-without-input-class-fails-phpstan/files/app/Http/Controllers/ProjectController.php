<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ProjectController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);

        return to_route('dashboard', ['created' => $request->string('name')->toString()]);
    }
}
