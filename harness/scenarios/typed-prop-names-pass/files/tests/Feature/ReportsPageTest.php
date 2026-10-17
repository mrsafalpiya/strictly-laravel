<?php

use App\Data\MemberData;
use App\Data\ReportStatsData;
use App\Models\User;
use App\Pages\ReportsPage;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\LaravelData\Lazy;

test('the reports page loads its deferred stats and lists the members', function () {
    Route::middleware('web')->get('reports', fn (): ReportsPage => new ReportsPage(
        title: 'Reports',
        stars: 3,
        stats: Lazy::inertiaDeferred(fn (): ReportStatsData => new ReportStatsData(openIssues: 3, closedIssues: 5)),
        members: User::query()->orderBy('id')->get()->map(
            fn (User $user): MemberData => new MemberData(name: $user->name, email: $user->email),
        )->all(),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('reports')
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports')
            ->missing('stats')
            ->loadDeferredProps(fn (Assert $reload) => $reload->where('stats.openIssues', 3)));
});
