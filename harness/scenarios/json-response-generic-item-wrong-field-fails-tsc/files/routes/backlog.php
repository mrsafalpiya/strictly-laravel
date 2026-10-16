<?php

use App\Http\Controllers\BacklogController;
use App\Pages\BacklogPage;
use Illuminate\Support\Facades\Route;

Route::get('backlog', fn (): BacklogPage => new BacklogPage)->name('backlog');
Route::get('backlog/issues', [BacklogController::class, 'show'])->name('backlog.issues');
