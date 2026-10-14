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
