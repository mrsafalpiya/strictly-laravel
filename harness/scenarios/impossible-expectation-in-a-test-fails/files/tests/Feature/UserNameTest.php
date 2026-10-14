<?php

use App\Models\User;

test('a user has a name', function () {
    $user = User::factory()->create();

    expect($user->name)->toBeInt();
});
