<?php

use App\Events\ProjectUpdated;
use App\Models\Project;
use App\Models\User;

test('updating a project broadcasts it to its owner', function () {
    $user = User::factory()->create();
    $project = Project::query()->create(['user_id' => $user->id, 'name' => 'Launch']);

    ProjectUpdated::dispatch($project);

    $project->update(['description' => 'The first release']);

    ProjectUpdated::dispatch($project);

    expect($project->description)->toBe('The first release');
});
