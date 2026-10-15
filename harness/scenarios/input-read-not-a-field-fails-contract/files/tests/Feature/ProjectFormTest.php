<?php

use App\Models\User;

test('a project is created from its input', function () {
    $this->actingAs(User::factory()->create())
        ->post('/projects', ['name' => 'Launch', 'public' => true])
        ->assertRedirect('/dashboard');
});
