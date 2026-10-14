<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
use App\Data\StoreProjectData;
use App\Enums\ToastType;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function index(): RedirectResponse
    {
        return to_route('dashboard');
    }

    public function store(StoreProjectData $data): RedirectResponse
    {
        if ($data->name === 'Taken') {
            // Not about a field the form has: an error toast, not an invented error key.
            FlashData::toast(ToastType::Error, 'A project with that name already exists.');

            return back();
        }

        return to_route('dashboard');
    }

    public function destroy(int $project): RedirectResponse
    {
        return back();
    }
}
