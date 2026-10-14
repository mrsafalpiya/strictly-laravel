<?php

use App\Pages\EstimatePage;
use Illuminate\Support\Facades\Route;

test('an issue nobody estimated shows a label', function () {
    Route::get('estimate', fn (): EstimatePage => new EstimatePage(estimate: 'unknown'));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('estimate')->assertOk();
});
