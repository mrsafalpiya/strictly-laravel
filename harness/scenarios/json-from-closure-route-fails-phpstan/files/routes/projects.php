<?php

use App\Models\Project;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('projects/recent', fn (): array => Project::query()->latest()->take(5)->get()->all())->name('projects.recent');
});
