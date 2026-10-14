<?php

use App\Models\User;
use App\Pages\MembersPage;
use Illuminate\Support\Facades\Route;

test('the members page lists every member', function () {
    Route::get('members', function (): MembersPage {
        // Hand-built from the models instead of through a Data class: sends every visible attribute.
        /** @var list<array{name: string, email: string}> $members */
        $members = User::query()->get()->toArray();

        return new MembersPage(members: $members);
    });

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('members')
        ->assertOk();
});
