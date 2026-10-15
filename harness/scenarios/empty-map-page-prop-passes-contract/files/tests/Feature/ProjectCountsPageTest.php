<?php

use App\Models\User;
use App\Pages\ProjectCountsPage;
use Illuminate\Support\Facades\Route;

test('a workspace without projects has no counts', function () {
    // PHP has no empty map: json_encode() sends both as [].
    Route::get('project-counts', fn (): ProjectCountsPage => new ProjectCountsPage(
        projectsByStatus: [],
        projectsByLead: [],
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('project-counts')
        ->assertOk();
});

test('a workspace with projects counts them by status and by lead', function () {
    Route::get('project-counts', fn (): ProjectCountsPage => new ProjectCountsPage(
        projectsByStatus: ['active' => 2],
        projectsByLead: ['Ada' => 2],
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('project-counts')
        ->assertOk();
});
