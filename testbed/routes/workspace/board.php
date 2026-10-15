<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BoardController;
use Illuminate\Support\Facades\Route;

Route::get('board', [BoardController::class, 'show'])->name('board.show');
Route::patch('projects/{project}/issues/{issue}/move', [BoardController::class, 'move'])->name('board.move');

Route::get('activity', [ActivityController::class, 'index'])->name('activity.index');
