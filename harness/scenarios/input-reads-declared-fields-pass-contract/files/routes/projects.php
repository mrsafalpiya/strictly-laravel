<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::post('workspaces/{workspace}/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::post('projects/preview', [ProjectController::class, 'preview'])->name('projects.preview');
});
