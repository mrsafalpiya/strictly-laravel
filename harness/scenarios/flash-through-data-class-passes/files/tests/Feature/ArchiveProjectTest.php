<?php

use App\Data\FlashData;
use App\Enums\ToastType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

test('archiving a project shows a toast on the dashboard', function () {
    Route::middleware('web')->post('projects/archive', function (): RedirectResponse {
        FlashData::toast(ToastType::Success, 'Project archived.');

        return to_route('dashboard');
    });

    $this->actingAs(User::factory()->create())
        ->post('projects/archive')
        ->assertRedirect(route('dashboard'));

    // Followed, the redirect renders the dashboard with the toast as the page's flash data.
    $this->followingRedirects()
        ->post('projects/archive')
        ->assertOk();
});
