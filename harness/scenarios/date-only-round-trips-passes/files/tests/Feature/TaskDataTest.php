<?php

use App\Data\TaskData;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/tasks', fn (TaskData $task): TaskData => $task);
});

test('a date-only property is read and sent as YYYY-MM-DD, other dates as ISO-8601', function () {
    $this->postJson('/tasks', ['title' => 'Ship', 'dueOn' => '2026-10-14', 'startsOn' => '2026-10-01', 'createdAt' => '2026-10-14T09:30:00+00:00'])
        ->assertCreated()
        ->assertExactJson(['title' => 'Ship', 'dueOn' => '2026-10-14', 'startsOn' => '2026-10-01', 'createdAt' => '2026-10-14T09:30:00+00:00']);
});

test('a date-only property rejects a timestamp or an impossible date with a validation error', function (string $dueOn) {
    $this->postJson('/tasks', ['title' => 'Ship', 'dueOn' => $dueOn, 'startsOn' => '2026-10-01', 'createdAt' => '2026-10-14T09:30:00+00:00'])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['dueOn']);
})->with(['2026-10-14T09:30:00+00:00', '2026-02-30', 'tomorrow']);
