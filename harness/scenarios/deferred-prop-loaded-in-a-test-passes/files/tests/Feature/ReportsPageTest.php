<?php

use App\Data\ReportStatsData;
use App\Models\User;
use App\Pages\ReportsPage;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\LaravelData\Lazy;

beforeEach(function () {
    Route::middleware('web')->get('reports', fn (): ReportsPage => new ReportsPage(
        title: 'Reports',
        stats: Lazy::inertiaDeferred(fn (): ReportStatsData => new ReportStatsData(openIssues: 3, closedIssues: 5)),
        lastYear: Lazy::inertia(fn (): ReportStatsData => new ReportStatsData(openIssues: 7, closedIssues: 2)),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('the reports page loads its stats after the first render', function () {
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page
            ->missing('stats')
            ->missing('lastYear')
            ->loadDeferredProps(fn (Assert $reload) => $reload->where('stats.openIssues', 3)));
});

test('the reports page loads last year when asked', function () {
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly('lastYear', fn (Assert $reload) => $reload->where('lastYear.openIssues', 7)));
});
