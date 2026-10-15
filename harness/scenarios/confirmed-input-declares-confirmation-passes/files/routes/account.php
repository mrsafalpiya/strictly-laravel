<?php

use App\Http\Controllers\AccountPasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::put('account/password', AccountPasswordController::class)->name('account.password');
});
