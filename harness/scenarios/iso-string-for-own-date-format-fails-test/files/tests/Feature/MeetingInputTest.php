<?php

use App\Data\StoreMeetingData;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/meetings', fn (StoreMeetingData $meeting): Response => response()->noContent());
});

test("toISOString()'s timestamp is accepted for a datetime input with its own format", function () {
    $this->postJson('/meetings', ['title' => 'Planning', 'startsAt' => '2026-10-14T09:30:00.000Z'])->assertNoContent();
});
