<?php

namespace App\Http\Controllers;

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;

final class ProjectController extends Controller
{
    public function store(StoreProjectData $data): RedirectResponse
    {
        return back();
    }
}
