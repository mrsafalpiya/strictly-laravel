<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data, Request $request): RedirectResponse
    {
        // The form's type has no `notify`, so the client never sends it and this is always false.
        $notify = $request->boolean('notify');

        return to_route('dashboard', $notify && $data->public ? ['notified' => 1] : []);
    }
}
