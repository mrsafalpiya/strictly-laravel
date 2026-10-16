<?php

use App\Pages\Projects\IndexPage;
use Illuminate\Support\Facades\Route;

test('the projects page lists every project', function () {
    Route::get('projects', fn (): IndexPage => new IndexPage(
        projects: [['name' => 'Tracklane', 'lead' => null]],
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('projects')->assertOk();
});
