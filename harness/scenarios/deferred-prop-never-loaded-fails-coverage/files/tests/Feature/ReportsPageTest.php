<?php

use App\Data\ReportStatsData;
use App\Models\User;
use App\Pages\ReportsPage;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelData\Lazy;

test('the reports page renders', function () {
    Route::middleware('web')->get('reports', fn (): ReportsPage => new ReportsPage(
        title: 'Reports',
        stats: Lazy::inertiaDeferred(fn (): ReportStatsData => new ReportStatsData(openIssues: 3, closedIssues: 5)),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    // The deferred stats are never loaded, so tsc never checks them.
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertOk();
});
