<?php

use App\Http\Controllers\ProjectController;
use App\Models\Project;
use App\Models\User;
use Inertia\Support\Header;
use Inertia\Testing\AssertableInertia as Assert;

test('the projects page lists projects and loads their stats after the first render', function () {
    Project::query()->create(['name' => 'Launch', 'description' => 'The first release']);
    Project::query()->create(['name' => 'Backlog', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->get(route('projects.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('projects.data', 2)
            ->missing('stats')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('stats.total', 2)
                ->where('stats.withoutDescription', 1)));
});

test('scrolling to the end of the list loads the next page of projects', function () {
    foreach (range(1, ProjectController::PER_PAGE + 1) as $number) {
        Project::query()->create(['name' => "Project {$number}", 'description' => null]);
    }

    $user = User::factory()->create();
    $first = $this->actingAs($user)->get(route('projects.index'));
    $cursor = data_get($first->viewData('page'), 'scrollProps.projects.nextPage');
    $version = data_get($first->viewData('page'), 'version');

    expect($cursor)->toBeString();

    // What <page.InfiniteScroll data="projects"> requests when the user reaches the end of the list.
    $this->actingAs($user)
        ->get(route('projects.index', ['cursor' => $cursor]), [
            Header::INERTIA => 'true',
            Header::VERSION => is_string($version) ? $version : '',
            Header::PARTIAL_COMPONENT => 'projects/index',
            Header::PARTIAL_ONLY => 'projects',
            Header::INFINITE_SCROLL_MERGE_INTENT => 'append',
        ])
        ->assertOk()
        ->assertJsonCount(1, 'props.projects.data');
});
