<?php

use App\Data\UpdateProfileData;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // No {user} parameter: #[CurrentUser] still resolves through the container.
    Route::patch('/profile', fn (UpdateProfileData $data): Response => response()->noContent())
        ->middleware(SubstituteBindings::class);
    // {user} binds another user; #[CurrentUser] User $user must not receive it.
    Route::patch('/users/{user}/follow-up', fn (UpdateProfileData $data, User $user): Response => response()->noContent())
        ->middleware(SubstituteBindings::class);
});

test('a verified user may keep their own email on a route without {user}', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson('/profile', ['email' => $user->email])
        ->assertNoContent();
});

test('an unverified user may not change their email', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->patchJson('/profile', ['email' => 'new@example.com'])
        ->assertForbidden();
});

test('a user may not take another user\'s email', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->patchJson('/profile', ['email' => $other->email])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['email' => 'The email has already been taken.']);
});

test('authorize() and rules() get the signed-in user, not the user the route binds to {user}', function () {
    $user = User::factory()->create();
    $unverified = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->patchJson("/users/{$unverified->id}/follow-up", ['email' => $user->email])
        ->assertNoContent();
});
