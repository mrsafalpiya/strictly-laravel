<?php

use App\Data\EntryData;
use App\Pages\FeedPage;
use Illuminate\Support\Facades\Route;

test('the feed lists entries, with or without a note', function () {
    Route::get('feed', fn (): FeedPage => FeedPage::of(
        new EntryData(title: 'First', note: null),
        new EntryData(title: 'Second', note: 'Has a note'),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('feed')->assertOk();
});
