<?php

use App\Data\ProjectFiltersData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('projects', fn (ProjectFiltersData $filters): JsonResponse => response()->json(['sort' => $filters->sort]))
        ->name('projects.index');
});
