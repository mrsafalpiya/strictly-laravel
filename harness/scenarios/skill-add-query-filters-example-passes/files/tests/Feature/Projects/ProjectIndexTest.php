<?php

use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Project::query()->create(['name' => 'Launch', 'description' => 'The first release']);
    Project::query()->create(['name' => 'Backlog', 'description' => null]);
});

test('the projects page lists every project by name without filters', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('projects.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters', ['search' => null, 'sort' => 'name'])
            ->where('projects.0.name', 'Backlog'));
});

test('the projects page filters by the query string', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('projects.index', ['search' => 'Lau', 'sort' => 'newest']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters', ['search' => 'Lau', 'sort' => 'newest'])
            ->has('projects', 1));
});

test('an invalid filter falls back to its default', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('projects.index', ['sort' => 'oldest']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'name'));
});
