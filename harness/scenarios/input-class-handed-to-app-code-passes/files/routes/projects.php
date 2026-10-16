<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::delete('projects/last', [ProjectController::class, 'forget'])->name('projects.forget');
});
