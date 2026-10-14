<?php

use App\Http\Controllers\IssueController;
use Illuminate\Support\Facades\Route;

Route::get('issues', [IssueController::class, 'index'])->name('issues.index');
Route::get('issues/create', [IssueController::class, 'create'])->name('issues.create');
Route::post('issues', [IssueController::class, 'store'])->name('issues.store');
Route::patch('issues/bulk', [IssueController::class, 'bulkUpdate'])->name('issues.bulk-update');

Route::get('projects/{project}/issues/{issue}', [IssueController::class, 'show'])->name('issues.show');
Route::patch('projects/{project}/issues/{issue}', [IssueController::class, 'update'])->name('issues.update');
Route::delete('projects/{project}/issues/{issue}', [IssueController::class, 'destroy'])->name('issues.destroy');
