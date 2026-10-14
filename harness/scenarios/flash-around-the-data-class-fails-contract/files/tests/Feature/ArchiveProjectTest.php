<?php

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

test('archiving a project shows a toast on the dashboard', function () {
    Route::middleware('web')->post('projects/archive', function (): RedirectResponse {
        // @phpstan-ignore strictly.inertiaFlash (the toast component reads `text` here)
        Inertia::flash('toast', ['type' => 'success', 'text' => 'Project archived.']);

        return to_route('dashboard');
    });

    $this->actingAs(User::factory()->create())
        ->post('projects/archive')
        ->assertRedirect(route('dashboard'));
});
