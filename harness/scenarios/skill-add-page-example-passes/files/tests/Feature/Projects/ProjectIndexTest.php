<?php

use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the projects page lists every project, with or without a description', function () {
    Project::query()->create(['name' => 'Launch', 'description' => 'The first release']);
    Project::query()->create(['name' => 'Backlog', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/index')
            ->has('projects', 2)
            ->where('projects.0.name', 'Backlog')
            ->where('projects.1.description', 'The first release'));
});
