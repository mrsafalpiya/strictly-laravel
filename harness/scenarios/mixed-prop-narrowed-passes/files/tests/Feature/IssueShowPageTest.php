<?php

use App\Data\IssueData;
use App\Models\User;
use App\Pages\Issues\ShowPage;
use Illuminate\Support\Facades\Route;

test('an imported issue shows where it came from', function () {
    Route::get('issue', fn (): ShowPage => new ShowPage(
        issue: new IssueData(
            title: 'Crash on save',
            meta: ['source' => 'github', 'number' => 42],
            customFields: ['severity' => 'high', 'estimate' => 3],
        ),
        context: 'From the board',
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('issue')
        ->assertOk();
});

test('an issue created in the app has no meta', function () {
    Route::get('issue', fn (): ShowPage => new ShowPage(
        issue: new IssueData(title: 'Crash on save', meta: null, customFields: []),
        context: null,
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('issue')
        ->assertOk();
});
