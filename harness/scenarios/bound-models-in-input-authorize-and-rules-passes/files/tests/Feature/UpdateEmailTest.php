<?php

use App\Data\UpdateEmailData;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::patch('/users/{user}/email', fn (UpdateEmailData $data, User $user): Response => response()->noContent())
        ->middleware(SubstituteBindings::class);
    // The action doesn't take the User, so the route leaves {user} the raw key.
    Route::patch('/unbound/{user}/email', fn (UpdateEmailData $data): Response => response()->noContent())
        ->middleware(SubstituteBindings::class);
});

test('a user may keep their own email', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson("/users/{$user->id}/email", ['email' => $user->email])
        ->assertNoContent();
});

test('a user may not take another user\'s email', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->patchJson("/users/{$user->id}/email", ['email' => $other->email])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['email' => 'The email has already been taken.']);
});

test('a user may not change another user\'s email', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->patchJson("/users/{$other->id}/email", ['email' => 'taken@example.com'])
        ->assertForbidden();
});

test('a route that leaves {user} unbound fails loudly instead of authorizing against an empty user', function () {
    $user = User::factory()->create();

    $this->withoutExceptionHandling();

    expect(fn () => $this->actingAs($user)->patchJson("/unbound/{$user->id}/email", ['email' => $user->email]))
        ->toThrow(LogicException::class, "but the route unbound/{user}/email binds {user} to string '{$user->id}', not a App\\Models\\User.");
});

test('validating the input outside a request to its route fails loudly instead of using an empty user', function () {
    expect(fn () => UpdateEmailData::validate(['email' => 'new@example.com']))
        ->toThrow(LogicException::class, 'App\\Data\\UpdateEmailData::rules() takes App\\Models\\User $user, the model the current route binds to {user}, but there is no current route.');
});
