<?php

use App\Data\StoreProjectData;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/projects', fn (StoreProjectData $project): Response => response()->noContent());
});

test('a user who may not create projects gets a 403 before the input is validated', function () {
    Gate::define('create-projects', fn (?User $user): bool => false);

    $this->postJson('/projects', [])->assertForbidden();
});

test('a user who may create projects gets the validation errors', function () {
    Gate::define('create-projects', fn (?User $user): bool => true);

    $this->postJson('/projects', [])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['name' => 'The name field is required.']);
});
