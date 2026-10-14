<?php

use App\Pages\MembersPage;
use Illuminate\Support\Facades\Route;

test('a workspace without members lists nobody', function () {
    Route::get('members', fn (): MembersPage => new MembersPage(members: []));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('members')->assertOk();
});
