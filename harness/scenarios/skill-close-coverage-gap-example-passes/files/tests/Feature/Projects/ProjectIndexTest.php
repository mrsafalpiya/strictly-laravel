<?php

use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the projects page lists every project', function () {
    Project::query()->create(['name' => 'Backlog', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('projects', 1));
});

test('the projects page shows a project description', function () {
    Project::query()->create(['name' => 'Launch', 'description' => 'The first release']);

    $this->actingAs(User::factory()->create())
        ->get(route('projects.index'))
        ->assertInertia(fn (Assert $page) => $page->where('projects.0.description', 'The first release'));
});
