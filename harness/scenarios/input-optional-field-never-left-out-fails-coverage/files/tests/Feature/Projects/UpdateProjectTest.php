<?php

use App\Models\Project;
use App\Models\User;

test('a project is renamed, with or without a new description', function () {
    $project = Project::query()->create(['name' => 'Launch', 'description' => null]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('projects.update', $project), ['name' => 'Release', 'description' => 'The first release'])
        ->assertSessionHasNoErrors();

    $this->actingAs($user)
        ->patch(route('projects.update', $project), ['name' => 'Release 1', 'description' => null])
        ->assertSessionHasNoErrors();

    expect($project->refresh()->name)->toBe('Release 1');
});
