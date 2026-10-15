<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');
