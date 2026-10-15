<?php

use App\Data\StatsData;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('stats', fn (): StatsData => new StatsData(projects: 3))->name('stats');
});
