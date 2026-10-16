<?php

use App\Data\BoardData;
use App\Data\IssueData;
use App\Data\ListingData;
use App\Pages\BoardPage;
use Illuminate\Support\Facades\Route;

test('the board lists its columns and their issues', function () {
    Route::get('board', fn (): BoardPage => new BoardPage(
        board: new BoardData(name: 'Launch', columns: [
            new ListingData(column: 'Backlog', items: [new IssueData(number: 1, title: 'Launch', assignee: null)]),
        ]),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('board')->assertOk();
});
