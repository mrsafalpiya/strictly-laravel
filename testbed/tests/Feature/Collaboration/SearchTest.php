<?php

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;

test('search returns matching issues and projects of the workspace as JSON', function () {
    [$workspace, $user, $project] = workspaceWith();
    $project->update(['name' => 'Payments platform']);
    Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'WEB', 'name' => 'Website']);
    Issue::factory()->create(['project_id' => $project->id, 'title' => 'Refund payments twice']);
    Issue::factory()->create(['project_id' => $project->id, 'title' => 'Unrelated']);
    [, , $foreignProject] = workspaceWith();
    Issue::factory()->create(['project_id' => $foreignProject->id, 'title' => 'Foreign payments']);

    $this->actingAs($user)
        ->getJson(route('search', [$workspace, 'q' => 'payment']))
        ->assertOk()
        ->assertExactJson([
            'issues' => [[
                'id' => Issue::query()->where('title', 'Refund payments twice')->sole()->id,
                'identifier' => 'TRK-1',
                'projectKey' => 'TRK',
                'number' => 1,
                'title' => 'Refund payments twice',
                'status' => Issue::query()->where('title', 'Refund payments twice')->sole()->status->value,
            ]],
            'projects' => [[
                'id' => $project->id,
                'key' => 'TRK',
                'name' => 'Payments platform',
                'color' => $project->color->value,
            ]],
        ]);
});

test('an identifier jumps straight to the issue', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory(3)->create(['project_id' => $project->id, 'title' => 'Something']);

    $this->actingAs($user)
        ->getJson(route('search', [$workspace, 'q' => 'trk-2']))
        ->assertOk()
        ->assertJsonCount(1, 'issues')
        ->assertJsonPath('issues.0.identifier', 'TRK-2')
        ->assertJsonCount(0, 'projects');
});

test('an empty query returns no results and LIKE wildcards are literal', function () {
    [$workspace, $user, $project] = workspaceWith();
    Issue::factory()->create(['project_id' => $project->id, 'title' => 'Anything']);

    $this->actingAs($user)->getJson(route('search', $workspace))
        ->assertOk()->assertExactJson(['issues' => [], 'projects' => []]);
    $this->actingAs($user)->getJson(route('search', [$workspace, 'q' => '%']))
        ->assertOk()->assertJsonCount(0, 'issues');
});

test('invalid query values are ignored instead of failing (QueryData is lenient)', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->getJson(route('search', [$workspace, 'q' => str_repeat('a', 101)]))
        ->assertOk()
        ->assertExactJson(['issues' => [], 'projects' => []]);
});

test('only members can search a workspace', function () {
    [$workspace] = workspaceWith();

    $this->actingAs(User::factory()->create())
        ->getJson(route('search', [$workspace, 'q' => 'a']))
        ->assertNotFound();
});
