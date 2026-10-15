<?php

use App\Data\PriorityChangedData;
use App\Data\StatusChangedData;
use App\Pages\ChangePage;
use Illuminate\Support\Facades\Route;

test('a change is a status or a priority change', function () {
    Route::get('status-change', fn (): ChangePage => new ChangePage(
        change: new StatusChangedData(from: 'todo', to: 'done'),
    ));
    Route::get('priority-change', fn (): ChangePage => new ChangePage(
        change: new PriorityChangedData(from: 'low', to: 'high'),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('status-change')->assertOk();
    $this->get('priority-change')->assertOk();
});
