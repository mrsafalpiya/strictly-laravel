<?php

use App\Http\Controllers\IssueController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('issues/{issue}', [IssueController::class, 'show'])->name('issues.show');
