<?php

use App\Data\ProjectSummaryData;
use App\Pages\Projects\IndexPage;
use Illuminate\Support\Facades\Route;

test('the projects page lists every project, led or not', function () {
    Route::get('projects', fn (): IndexPage => new IndexPage(projects: [
        new ProjectSummaryData(name: 'Tracklane', lead: 'Ada'),
        new ProjectSummaryData(name: 'Billing', lead: null),
    ]));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('projects')->assertOk();
});
