<?php

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::post('projects', fn (Request $request): RedirectResponse => to_route('dashboard', ['created' => $request->string('name')->toString()]))
        ->name('projects.store');
});
