<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data, Request $request): RedirectResponse
    {
        Log::info('Project created.', [
            'name' => $data->name,
            'user' => $request->user()?->getAuthIdentifier(),
            'route' => $request->routeIs('projects.store'),
            'agent' => $request->header('User-Agent'),
            'ip' => $request->ip(),
        ]);

        $request->session()->put('last_project', $data->name);

        return to_route('dashboard', $data->public ? ['public' => 1] : []);
    }
}
