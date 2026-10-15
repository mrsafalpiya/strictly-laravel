<?php

use App\Data\StoreMeetingData;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/meetings', fn (StoreMeetingData $meeting): Response => response()->noContent());
});

test('a calendar date is accepted for a datetime input', function () {
    $this->postJson('/meetings', ['title' => 'Planning', 'startsAt' => '2026-10-14'])->assertNoContent();
});
