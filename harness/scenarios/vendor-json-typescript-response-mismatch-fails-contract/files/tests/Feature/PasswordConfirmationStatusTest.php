<?php

use App\Models\User;

test('the password confirmation status is reported', function () {
    $this->actingAs(User::factory()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson(route('password.confirmation'))
        ->assertOk()
        ->assertJsonPath('confirmed', true);
});
