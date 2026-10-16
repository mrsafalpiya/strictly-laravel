<?php

use App\Models\User;

test('a project is created from its input', function () {
    $user = User::factory()->create(['name' => 'Ada']);

    $this->actingAs($user)
        ->post('/projects', ['name' => 'Launch'])
        ->assertRedirect('/dashboard?created=Launch')
        ->assertSessionHas('last_project', 'Ada: Launch');
});

test('the last project is forgotten', function () {
    $this->actingAs(User::factory()->create())
        ->withSession(['last_project' => 'Ada: Launch'])
        ->delete('/projects/last')
        ->assertRedirect('/dashboard')
        ->assertSessionMissing('last_project');
});
