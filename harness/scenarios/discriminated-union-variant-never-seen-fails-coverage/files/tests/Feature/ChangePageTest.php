<?php

use App\Data\StatusChangedData;
use App\Pages\ChangePage;
use Illuminate\Support\Facades\Route;

test('a change can be a status change', function () {
    Route::get('change', fn (): ChangePage => new ChangePage(
        change: new StatusChangedData(from: 'todo', to: 'done'),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('change')->assertOk();
});
