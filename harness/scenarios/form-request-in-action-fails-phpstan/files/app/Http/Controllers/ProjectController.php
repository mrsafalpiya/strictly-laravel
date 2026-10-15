<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        return to_route('dashboard', $validated === [] ? [] : ['created' => 1]);
    }
}
