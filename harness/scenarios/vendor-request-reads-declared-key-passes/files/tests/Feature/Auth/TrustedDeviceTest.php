<?php

use App\Models\User;

test('a user can trust the device they log in on', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password', 'remember' => false, 'trust_device' => true])
        ->assertRedirect(route('dashboard', absolute: false))
        ->assertSessionHas('device_trusted', true);

    $this->assertAuthenticatedAs($user);
});
