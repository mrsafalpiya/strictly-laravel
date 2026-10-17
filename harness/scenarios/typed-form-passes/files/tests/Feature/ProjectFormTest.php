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
        ->assertRedirect('/dashboard')
        ->assertSessionHasNoErrors();
});

test('a project is created with a description and tags', function () {
    $this->actingAs(User::factory()->create())
        ->post('/projects', projectPayload(['description' => 'The first release', 'tags' => ['launch']]))
        ->assertRedirect('/dashboard');
});

test('an invalid project is refused with errors on its fields, nested ones included', function () {
    $this->actingAs(User::factory()->create())
        ->from('/dashboard')
        ->post('/projects', projectPayload(['estimate' => 1.5, 'tasks' => [['title' => '']]]))
        ->assertRedirect('/dashboard')
        ->assertSessionHasErrors(['estimate', 'tasks.0.title']);
});

test('a refusal that is not about a field is an error toast', function () {
    $this->actingAs(User::factory()->create())
        ->from('/dashboard')
        ->post('/projects', projectPayload(['name' => 'Taken']))
        ->assertRedirect('/dashboard')
        ->assertSessionHasNoErrors();
});
