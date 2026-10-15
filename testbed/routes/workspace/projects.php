<?php

use App\Http\Controllers\CycleController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\ProjectController;
use App\Http\Middleware\EnsureFeatureEnabled;
use Illuminate\Support\Facades\Route;

Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('projects/create', [ProjectController::class, 'create'])->name('projects.create');
Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
Route::get('projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
Route::patch('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive');
Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

Route::middleware(EnsureFeatureEnabled::class.':labels')->group(function () {
    Route::get('labels', [LabelController::class, 'index'])->name('labels.index');
    Route::post('labels', [LabelController::class, 'store'])->name('labels.store');
    Route::patch('labels/{label}', [LabelController::class, 'update'])->name('labels.update');
    Route::delete('labels/{label}', [LabelController::class, 'destroy'])->name('labels.destroy');
});

Route::middleware(EnsureFeatureEnabled::class.':cycles')->group(function () {
    Route::get('cycles', [CycleController::class, 'index'])->name('cycles.index');
    Route::post('cycles', [CycleController::class, 'store'])->name('cycles.store');
    Route::get('cycles/{cycle}', [CycleController::class, 'show'])->name('cycles.show');
    Route::patch('cycles/{cycle}', [CycleController::class, 'update'])->name('cycles.update');
    Route::delete('cycles/{cycle}', [CycleController::class, 'destroy'])->name('cycles.destroy');
});
