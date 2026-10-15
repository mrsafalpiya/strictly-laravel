<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('the project list is filtered by its query string and sends the filters back', function () {
    $this->actingAs(User::factory()->create())
        ->get('/projects?search=la&statuses[]=active&sort=name&includeArchived=1')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/index')
            ->where('filters', [
                'search' => 'la',
                'statuses' => ['active'],
                'sort' => 'name',
                'page' => 1,
                'includeArchived' => true,
            ])
            ->where('projects', ['Launch'])
            ->etc());
});

test('an old bookmark with invalid filters shows the default list instead of an error', function () {
    $this->actingAs(User::factory()->create())
        ->get('/projects?statuses[]=deleted&sort=oldest&page=first')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('filters.statuses', [])
            ->where('filters.sort', 'newest')
            ->where('filters.page', 1)
            ->where('projects', ['Launch', 'Billing'])
            ->etc());
});
