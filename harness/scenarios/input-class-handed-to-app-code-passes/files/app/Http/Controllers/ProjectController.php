<?php

namespace App\Http\Controllers;

use App\Actions\CreateProject;
use App\Data\StoreProjectData;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data, CreateProject $create, #[CurrentUser] User $user): RedirectResponse
    {
        return to_route('dashboard', ['created' => $create->handle($data, $user)]);
    }

    public function forget(Request $request, CreateProject $create): RedirectResponse
    {
        $create->forget($request->user());

        return to_route('dashboard');
    }
}
