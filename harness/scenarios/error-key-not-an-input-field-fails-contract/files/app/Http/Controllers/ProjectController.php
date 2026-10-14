<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

final class ProjectController extends Controller
{
    public function index(): RedirectResponse
    {
        return to_route('dashboard');
    }

    public function store(StoreProjectData $data): RedirectResponse
    {
        if ($data->name === 'Taken') {
            throw ValidationException::withMessages(['project' => 'A project with that name already exists.']);
        }

        return to_route('dashboard');
    }

    public function destroy(int $project): RedirectResponse
    {
        return back();
    }
}
