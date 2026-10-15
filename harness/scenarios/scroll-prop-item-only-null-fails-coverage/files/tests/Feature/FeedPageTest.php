<?php

use App\Data\EntryData;
use App\Pages\FeedPage;
use Illuminate\Support\Facades\Route;

test('the feed lists entries', function () {
    Route::get('feed', fn (): FeedPage => FeedPage::of(new EntryData(title: 'First', note: null)));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('feed')->assertOk();
});
