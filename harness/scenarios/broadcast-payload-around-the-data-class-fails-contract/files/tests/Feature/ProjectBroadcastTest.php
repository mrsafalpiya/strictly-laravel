<?php

use App\Events\ProjectUpdated;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

test('updating a project broadcasts it to its owner', function () {
    $user = User::factory()->create();
    $project = Project::query()->create(['user_id' => $user->id, 'name' => 'Launch']);

    ProjectUpdated::dispatch($project);

    $project->update(['description' => 'The first release']);
    Cache::put("projects.{$project->id}.issues", ['open' => 3]);

    ProjectUpdated::dispatch($project);

    expect($project->description)->toBe('The first release');
});
