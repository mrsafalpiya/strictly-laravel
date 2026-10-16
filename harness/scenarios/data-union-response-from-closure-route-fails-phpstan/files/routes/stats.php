<?php

use App\Data\StatsData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('stats', fn (Request $request): StatsData|RedirectResponse => $request->user()?->email_verified_at === null
        ? redirect()->route('verification.notice')
        : new StatsData(projects: 3))->name('stats');
});
