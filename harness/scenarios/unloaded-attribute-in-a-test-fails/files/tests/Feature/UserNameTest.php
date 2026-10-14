<?php

use App\Models\User;

test('a user keeps their name', function () {
    User::factory()->create(['name' => 'Ada']);

    $user = User::query()->select(['id'])->firstOrFail();

    expect($user->name)->toBe('Ada');
});
