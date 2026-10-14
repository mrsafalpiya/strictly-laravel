<?php

use App\Data\ReportData;
use App\Data\ReportStatsData;
use App\Models\User;
use App\Pages\ReportsPage;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\LaravelData\Lazy;

beforeEach(function () {
    Route::middleware('web')->get('reports', fn (): ReportsPage => new ReportsPage(
        title: 'Reports',
        report: new ReportData(
            name: 'Q3',
            stats: Lazy::inertiaDeferred(fn (): ReportStatsData => new ReportStatsData(openIssues: 3, closedIssues: 5)),
        ),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('the report reloads just its stats', function () {
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page
            ->missing('report.stats')
            ->reload(only: ['report.stats'], callback: fn (Assert $reload) => $reload
                ->where('report.stats.openIssues', 3)
                ->missing('report.name')
                ->missing('title')));
});

test('the report reloads everything but the title', function () {
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page
            ->reloadExcept('title', fn (Assert $reload) => $reload->where('report.name', 'Q3')));
});
