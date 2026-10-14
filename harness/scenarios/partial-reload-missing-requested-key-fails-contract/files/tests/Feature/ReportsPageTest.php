<?php

use App\Data\ReportStatsData;
use App\Models\User;
use App\Pages\ReportsPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\LaravelData\Lazy;

beforeEach(function () {
    // The stats are only for verified users, but the page's "Refresh" button reloads them for everyone.
    Route::middleware('web')->get('reports', fn (Request $request): ReportsPage => new ReportsPage(
        title: 'Reports',
        stats: Lazy::when(
            fn (): bool => $request->user()?->hasVerifiedEmail() === true,
            fn (): ReportStatsData => new ReportStatsData(openIssues: 3, closedIssues: 5),
        ),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('a verified user reloads the stats', function () {
    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page->reload(only: ['stats']));
});

test('an unverified user reloads the stats', function () {
    $this->actingAs(User::factory()->unverified()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page->reload(only: ['stats']));
});
