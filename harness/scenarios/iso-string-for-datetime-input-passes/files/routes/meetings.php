<?php

use App\Http\Controllers\MeetingController;
use Illuminate\Support\Facades\Route;

Route::get('meetings', [MeetingController::class, 'index'])->name('meetings.index');
Route::post('meetings', [MeetingController::class, 'store'])->name('meetings.store');
