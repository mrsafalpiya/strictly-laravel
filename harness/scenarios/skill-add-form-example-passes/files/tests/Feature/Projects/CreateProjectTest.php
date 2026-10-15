<?php

use App\Models\Project;
use App\Models\User;

test('a project is created from the form', function () {
    $this->actingAs(User::factory()->create())
        ->from(route('dashboard'))
        ->post(route('projects.store'), ['name' => 'Launch', 'description' => 'The first release'])
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasNoErrors();

    expect(Project::query()->where('name', 'Launch')->exists())->toBeTrue();
});

test('a project needs no description', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), ['name' => 'Backlog', 'description' => null])
        ->assertSessionHasNoErrors();
});

test('a taken name is an error on the name field', function () {
    Project::query()->create(['name' => 'Launch', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->from(route('dashboard'))
        ->post(route('projects.store'), ['name' => 'Launch', 'description' => null])
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors(['name']);
});
