<?php

use App\Data\BoardData;
use App\Data\IssueData;
use App\Data\ListingData;
use App\Pages\BacklogPage;
use App\Pages\BoardPage;
use Illuminate\Support\Facades\Route;

/**
 * @return list<IssueData>
 */
function issues(): array
{
    return [
        new IssueData(number: 1, title: 'Launch', assignee: null),
        new IssueData(number: 2, title: 'Polish', assignee: 'Ada'),
    ];
}

beforeEach(function () {
    // The pages aren't in the app's Vite build.
    $this->withoutVite();
});

test('the backlog lists assigned and unassigned issues', function () {
    Route::get('backlog', fn (): BacklogPage => new BacklogPage(
        backlog: new ListingData(column: 'Backlog', items: issues()),
    ));

    $this->get('backlog')->assertOk();
});

test('the board lists assigned and unassigned issues in its columns', function () {
    Route::get('board', fn (): BoardPage => new BoardPage(
        board: new BoardData(name: 'Launch', columns: [new ListingData(column: 'Backlog', items: issues())]),
    ));

    $this->get('board')->assertOk();
});
