<?php

use App\Data\UpdateEmailData;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::patch('/users/{user}/email', fn (UpdateEmailData $data, User $user): Response => response()->noContent())
        ->middleware(SubstituteBindings::class);
});

test('a user may change their own email', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson("/users/{$user->id}/email", ['email' => 'new@example.com'])
        ->assertNoContent();
});
