<?php

use App\Http\Controllers\ProjectController;
use App\Pages\DashboardPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('projects/stats', [ProjectController::class, 'stats'])->name('projects.stats');
    Route::get('projects/overview', fn (): DashboardPage => new DashboardPage)->name('projects.overview');
    Route::get('projects/summary', fn (Request $request): DashboardPage|RedirectResponse => $request->user()?->email_verified_at === null
        ? redirect()->route('verification.notice')
        : new DashboardPage)->name('projects.summary');
    Route::get('projects/owner', fn (Request $request): JsonResponse => response()->json(['email' => $request->user()?->email]))
        ->name('projects.owner');
});
