<?php

use App\Data\ProjectFiltersData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/projects', fn (ProjectFiltersData $filters): JsonResponse => response()->json($filters->toArray()));
});

test('a bookmark with a sort that no longer exists is refused', function () {
    $this->getJson('/projects?sort=oldest')->assertUnprocessable();
});
