<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('projects/recent', [ProjectController::class, 'recent'])->name('projects.recent');
