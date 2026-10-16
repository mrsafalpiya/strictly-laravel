<?php

use App\Http\Controllers\MeetingController;
use Illuminate\Support\Facades\Route;

Route::post('meetings', [MeetingController::class, 'store'])->name('meetings.store');
