<?php

use App\Models\User;

test('every user starts without passkeys', function () {
    User::factory()->count(2)->create();

    $counts = User::query()->orderBy('id')->get()
        ->map(fn (User $user): int => $user->passkeys->count());

    expect($counts->all())->toBe([0, 0]);
});
