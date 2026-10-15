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
