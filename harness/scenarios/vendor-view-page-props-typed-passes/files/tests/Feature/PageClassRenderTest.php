<?php

use Inertia\Testing\AssertableInertia;

test("Fortify's login view renders the LoginPage props", function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/login')
            ->where('canResetPassword', true)
            ->where('status', null)
            ->etc()); // the shared props
});
