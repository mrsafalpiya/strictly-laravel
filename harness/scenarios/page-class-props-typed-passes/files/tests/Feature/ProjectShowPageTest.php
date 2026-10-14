<?php

use App\Data\ProjectData;
use App\Pages\Projects\ShowPage;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

test('a route that returns a Page class renders its page component with its props', function () {
    Route::get('projects/tracklane', fn (): ShowPage => new ShowPage(
        project: new ProjectData(name: 'Tracklane', openIssues: 3),
        status: null,
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('projects/tracklane')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/show')
            ->where('project', ['name' => 'Tracklane', 'openIssues' => 3])
            ->where('status', null)
            ->etc()); // the shared props
});

test('a Page class prop can carry a status message', function () {
    Route::get('projects/tracklane', fn (): ShowPage => new ShowPage(
        project: new ProjectData(name: 'Tracklane', openIssues: 0),
        status: 'Project archived.',
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('projects/tracklane')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('status', 'Project archived.')->etc());
});
