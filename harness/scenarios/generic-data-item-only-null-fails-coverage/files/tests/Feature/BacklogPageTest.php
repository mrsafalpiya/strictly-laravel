<?php

use App\Data\IssueData;
use App\Data\ListingData;
use App\Pages\BacklogPage;
use Illuminate\Support\Facades\Route;

test('the backlog lists its issues', function () {
    Route::get('backlog', fn (): BacklogPage => new BacklogPage(
        backlog: new ListingData(column: 'Backlog', items: [new IssueData(number: 1, title: 'Launch', assignee: null)]),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('backlog')->assertOk();
});
