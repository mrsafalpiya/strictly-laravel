<?php

use App\Models\Project;
use App\Models\User;

test('a free project name is available', function () {
    $this->actingAs(User::factory()->create())
        ->postJson(route('projects.check-name'), ['name' => 'Launch'])
        ->assertSuccessful()
        ->assertExactJson(['available' => true, 'suggestion' => null]);
});

test('a taken project name comes with a suggestion', function () {
    Project::query()->create(['name' => 'Launch', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->postJson(route('projects.check-name'), ['name' => 'Launch'])
        ->assertSuccessful()
        ->assertExactJson(['available' => false, 'suggestion' => 'Launch 2']);
});

test('a name that is too long is refused with an error on the name field', function () {
    $this->actingAs(User::factory()->create())
        ->postJson(route('projects.check-name'), ['name' => str_repeat('a', 81)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});
