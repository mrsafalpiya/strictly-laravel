<?php

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;

beforeEach(function () {
    // The pages aren't in the app's Vite build.
    $this->withoutVite();
});

test('an issue page links to its project', function () {
    $project = Project::query()->create(['name' => 'Launch']);
    $issue = Issue::query()->create(['project_id' => $project->id, 'title' => 'Kick-off']);

    $this->get(route('issues.show', $issue))->assertOk();
});

test('a project page links to itself', function () {
    $project = Project::query()->create(['name' => 'Launch']);

    $this->get(route('projects.show', $project))->assertOk();
});

test('each table has its own id range in tests', function () {
    $user = User::factory()->create();
    $project = Project::query()->create(['name' => 'Launch']);
    $issue = Issue::query()->create(['project_id' => $project->id, 'title' => 'Kick-off']);

    expect([$user->id, $project->id, $issue->id])->toHaveCount(3)
        ->and(array_unique([$user->id, $project->id, $issue->id]))->toHaveCount(3);
});
