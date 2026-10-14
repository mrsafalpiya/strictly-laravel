<?php

use App\Models\User;

/**
 * @return array<string, mixed>
 */
function projectPayload(): array
{
    return [
        'name' => 'Launch',
        'public' => true,
        'tags' => ['q4'],
        'settings' => ['notifyOnAssign' => true],
    ];
}

test('a project is created from its input', function () {
    $this->actingAs(User::factory()->create())
        ->post('/workspaces/7/projects', projectPayload())
        ->assertRedirect('/dashboard');
});

test('a project is previewed from its input', function () {
    $this->actingAs(User::factory()->create())
        ->postJson('/projects/preview', projectPayload())
        ->assertCreated()
        ->assertJson(['name' => 'Launch', 'members' => 1, 'moreRecent' => false]);
});
