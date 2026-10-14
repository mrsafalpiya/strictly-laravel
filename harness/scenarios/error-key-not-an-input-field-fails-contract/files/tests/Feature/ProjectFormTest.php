<?php

use App\Models\User;

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function projectPayload(array $overrides = []): array
{
    return [
        'name' => 'Launch',
        'description' => null,
        'estimate' => 3,
        'tags' => [],
        'settings' => ['notifyOnAssign' => true],
        'tasks' => [['title' => 'Kick-off']],
        ...$overrides,
    ];
}

test('a project is created from its input', function () {
    $this->actingAs(User::factory()->create())
        ->post('/projects', projectPayload())
        ->assertRedirect('/dashboard');
});

test('a taken name is refused', function () {
    $this->actingAs(User::factory()->create())
        ->from('/dashboard')
        ->post('/projects', projectPayload(['name' => 'Taken']))
        ->assertSessionHasErrors(['project']);
});
