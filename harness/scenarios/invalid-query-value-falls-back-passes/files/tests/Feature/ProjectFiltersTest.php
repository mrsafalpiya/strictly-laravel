<?php

use App\Data\ProjectFiltersData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/projects', fn (ProjectFiltersData $filters): JsonResponse => response()->json($filters->toArray()));
});

test('an empty query string is every default', function () {
    $this->getJson('/projects')->assertOk()->assertExactJson([
        'search' => null,
        'statuses' => [],
        'sort' => 'newest',
        'page' => 1,
        'includeArchived' => false,
    ]);
});

test('a valid query string is parsed into its types', function () {
    $this->getJson('/projects?search=launch&statuses[]=archived&statuses[]=active&sort=name&page=3&includeArchived=1')
        ->assertOk()
        ->assertExactJson([
            'search' => 'launch',
            'statuses' => ['archived', 'active'],
            'sort' => 'name',
            'page' => 3,
            'includeArchived' => true,
        ]);
});

test('an invalid value falls back to its default and an invalid list item is dropped', function () {
    $search = str_repeat('a', 101);

    $this->getJson("/projects?search={$search}&statuses[]=active&statuses[]=deleted&sort=oldest&page=two&includeArchived=maybe")
        ->assertOk()
        ->assertExactJson([
            'search' => null,
            'statuses' => ['active'],
            'sort' => 'newest',
            'page' => 1,
            'includeArchived' => false,
        ]);
});

test('a list sent as a single value falls back to its default', function () {
    $this->getJson('/projects?statuses=active&page=2')
        ->assertOk()
        ->assertJson(['statuses' => [], 'page' => 2]);
});
