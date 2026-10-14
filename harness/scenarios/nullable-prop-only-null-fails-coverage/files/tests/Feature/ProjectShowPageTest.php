<?php

use App\Data\ProjectData;
use App\Pages\Projects\ShowPage;
use Illuminate\Support\Facades\Route;

test('a project without a lead says so', function () {
    Route::get('projects/tracklane', fn (): ShowPage => new ShowPage(
        project: new ProjectData(name: 'Tracklane', lead: null),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('projects/tracklane')->assertOk();
});
