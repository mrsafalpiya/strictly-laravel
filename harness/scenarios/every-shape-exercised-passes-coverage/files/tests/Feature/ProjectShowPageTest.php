<?php

use App\Data\IssueData;
use App\Data\MemberData;
use App\Data\MilestoneData;
use App\Data\ProjectData;
use App\Pages\Projects\ShowPage;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelData\Optional;

beforeEach(function () {
    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('a new project has no lead, members or estimate yet', function () {
    Route::get('projects/tracklane', fn (): ShowPage => new ShowPage(
        project: new ProjectData(name: 'Tracklane', lead: null),
        members: [],
        focus: new IssueData(number: 1, title: 'Set up the repository'),
        estimate: 'unknown',
        openIssues: Optional::create(),
    ));

    $this->get('projects/tracklane')->assertOk();
});

test('a running project shows its lead, members and next milestone', function () {
    Route::get('projects/tracklane', fn (): ShowPage => new ShowPage(
        project: new ProjectData(name: 'Tracklane', lead: 'Ada'),
        members: [new MemberData(name: 'Ada', email: 'ada@example.com')],
        focus: new MilestoneData(title: 'Beta', due: '2026-11-01'),
        estimate: 5,
        openIssues: 3,
    ));

    $this->get('projects/tracklane')->assertOk();
});
