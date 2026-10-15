<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('projects/{project}/lookup', [ProjectController::class, 'find'])->name('projects.find');
});
