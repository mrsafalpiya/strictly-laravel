<?php

use Inertia\Testing\AssertableInertia as Assert;

test('every page receives the feature flags from config/tracklane.php', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('projects.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('features', ['cycles' => true, 'labels' => true]));
});

test('guests receive the feature flags too', function () {
    config(['tracklane.features.labels' => false]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('features', ['cycles' => true, 'labels' => false]));
});

test('turning cycles off shares the flag and takes the cycle routes away', function () {
    config(['tracklane.features.cycles' => false]);
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('labels.index', $workspace))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('features', ['cycles' => false, 'labels' => true]));

    $this->actingAs($user)
        ->get(route('cycles.index', $workspace))
        ->assertNotFound();
});

test('turning labels off takes the label routes away', function () {
    config(['tracklane.features.labels' => false]);
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->get(route('labels.index', $workspace))
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('cycles.index', $workspace))
        ->assertOk();
});
