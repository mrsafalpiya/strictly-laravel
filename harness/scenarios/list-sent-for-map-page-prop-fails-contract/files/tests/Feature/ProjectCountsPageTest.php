<?php

use App\Models\User;
use App\Pages\ProjectCountsPage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

test('the counts list each lead', function () {
    Route::get('project-counts', function (): ProjectCountsPage {
        /** @var array<string, int> $projectsByLead */
        $projectsByLead = Cache::get('projects-by-lead', []);

        return new ProjectCountsPage(projectsByStatus: ['active' => 2], projectsByLead: $projectsByLead);
    });

    // Cached without the names the counts are keyed by: the map is sent as a list.
    Cache::put('projects-by-lead', [3, 1]);

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('project-counts')
        ->assertOk();
});
