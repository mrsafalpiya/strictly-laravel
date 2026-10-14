<?php

use App\Data\ProjectData;
use App\Pages\SearchResultPage;
use Illuminate\Support\Facades\Route;

test('a search can match a project', function () {
    Route::get('search', fn (): SearchResultPage => new SearchResultPage(
        match: new ProjectData(name: 'Tracklane', openIssues: 3),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('search')->assertOk();
});
