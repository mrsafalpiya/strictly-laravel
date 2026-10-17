<?php

use App\Models\Project;
use App\Models\User;

test('a project is created from the form, with no description', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), ['name' => 'Launch', 'description' => null])
        ->assertSessionHasNoErrors();

    expect(Project::query()->where('name', 'Launch')->exists())->toBeTrue();
});

test('a taken name is an error on the name field', function () {
    Project::query()->create(['name' => 'Launch', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), ['name' => 'Launch', 'description' => 'The first release'])
        ->assertSessionHasErrors(['name']);
});
