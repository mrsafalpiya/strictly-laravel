<?php

use App\Models\User;

test('the password is changed', function () {
    $this->actingAs(User::factory()->create())
        ->put('/account/password', ['password' => 'new-secret', 'password_confirmation' => 'new-secret'])
        ->assertRedirect('/dashboard')
        ->assertSessionHasNoErrors();
});
