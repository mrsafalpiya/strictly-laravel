<?php

use App\Data\StoreProjectData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::post('projects', fn (StoreProjectData $data): RedirectResponse => to_route('dashboard', ['created' => $data->name]))
        ->name('projects.store');
});
