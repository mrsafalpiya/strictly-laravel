<?php

use App\Data\StoreProjectData;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

test('a project is created', function () {
    $this->actingAs(User::factory()->create())
        ->post('/projects', ['name' => 'Launch'])
        ->assertRedirect('/dashboard?created=Launch');
});

test('the project stats count the projects', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/projects/stats')
        ->assertOk()
        ->assertJsonPath('projects', 3);
});

test('the project owner is the signed-in user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/projects/owner')
        ->assertOk()
        ->assertJsonPath('email', $user->email);
});

test('a route a test registers may take an input class', function () {
    Route::post('/test/projects', fn (StoreProjectData $data): Response => response()->noContent());

    $this->postJson('/test/projects', ['name' => ''])->assertJsonValidationErrors(['name']);
});
