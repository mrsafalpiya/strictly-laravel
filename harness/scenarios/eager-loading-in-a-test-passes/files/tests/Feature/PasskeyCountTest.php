<?php

use App\Models\User;

test('every user starts without passkeys', function () {
    User::factory()->count(2)->create(['name' => 'Ada']);

    $users = User::query()->select(['id', 'name'])->with('passkeys')->orderBy('id')->get();

    expect($users->map(fn (User $user): string => "{$user->name}: {$user->passkeys->count()}")->all())
        ->toBe(['Ada: 0', 'Ada: 0']);
});
