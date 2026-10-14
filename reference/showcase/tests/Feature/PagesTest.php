<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('welcome page renders for guests and users', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome')->where('auth.user', null));

    $this->actingAs($user = User::factory()->create())
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('auth.user.id', $user->id));
});

test('appearance settings page renders', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('settings/appearance'));
});
