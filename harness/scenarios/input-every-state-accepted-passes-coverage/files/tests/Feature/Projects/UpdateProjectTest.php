<?php

use App\Models\Project;
use App\Models\User;

test('a project is renamed, then given a description and then none, each change keeping the other field', function () {
    $project = Project::query()->create(['name' => 'Launch', 'description' => null]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('projects.update', $project), ['name' => 'Release'])
        ->assertSessionHasNoErrors();

    $this->actingAs($user)
        ->patch(route('projects.update', $project), ['description' => 'The first release'])
        ->assertSessionHasNoErrors();

    expect($project->refresh())->name->toBe('Release')->description->toBe('The first release');

    $this->actingAs($user)
        ->patch(route('projects.update', $project), ['description' => null])
        ->assertSessionHasNoErrors();

    expect($project->refresh())->name->toBe('Release')->description->toBeNull();
});
