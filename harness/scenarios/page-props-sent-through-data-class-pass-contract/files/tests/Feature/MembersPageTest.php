<?php

use App\Data\MemberData;
use App\Models\User;
use App\Pages\MembersPage;
use Illuminate\Support\Facades\Route;

test('the members page lists every member', function () {
    Route::get('members', fn (): MembersPage => new MembersPage(
        members: array_values(User::query()->get()->map(
            fn (User $user): MemberData => new MemberData(name: $user->name, email: $user->email),
        )->all()),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->actingAs(User::factory()->create())
        ->get('members')
        ->assertOk();
});
