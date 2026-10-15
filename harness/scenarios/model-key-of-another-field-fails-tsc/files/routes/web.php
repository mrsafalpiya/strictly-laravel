<?php

use App\Http\Controllers\IssueController;
use App\Pages\DashboardPage;
use App\Pages\WelcomePage;
use Illuminate\Support\Facades\Route;

Route::get('/', fn (): WelcomePage => new WelcomePage)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn (): DashboardPage => new DashboardPage)->name('dashboard');
    Route::get('issues', [IssueController::class, 'index'])->name('issues.index');
    Route::patch('issues', [IssueController::class, 'bulkUpdate'])->name('issues.bulk-update');
    Route::get('issues/{issue}', [IssueController::class, 'show'])->name('issues.show');
});

require __DIR__.'/settings.php';
