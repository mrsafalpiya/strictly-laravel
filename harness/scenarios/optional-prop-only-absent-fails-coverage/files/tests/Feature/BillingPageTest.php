<?php

use App\Pages\BillingPage;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelData\Optional;

test('billing shows the seats', function () {
    Route::get('billing', fn (): BillingPage => new BillingPage(seats: 5, discount: Optional::create()));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('billing')->assertOk();
});
