<?php

use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::post('search', [SearchController::class, 'search'])->name('search');
Route::get('search/stats', [SearchController::class, 'stats'])->name('search.stats');
Route::get('search/health', [SearchController::class, 'health'])->name('search.health');
