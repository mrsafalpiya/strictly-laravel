<?php

use App\Data\StoreMeetingData;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/meetings', fn (StoreMeetingData $meeting): StoreMeetingData => $meeting);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validMeeting(array $overrides = []): array
{
    return [
        'title' => 'Planning',
        'startsAt' => '2026-10-14T09:30:00+02:00',
        'endsAt' => null,
        'heldOn' => '2026-10-14',
        'bookedAt' => '2026-10-01 12:00:00',
        'reminders' => ['2026-10-13T09:30:00+00:00'],
        ...$overrides,
    ];
}

test('an ISO-8601 timestamp (Z included), a date-only date, null and a missing optional key round-trip', function () {
    $this->postJson('/meetings', validMeeting())
        ->assertCreated()
        ->assertExactJson([
            'title' => 'Planning',
            'startsAt' => '2026-10-14T09:30:00+02:00',
            'endsAt' => null,
            'heldOn' => '2026-10-14',
            'bookedAt' => '2026-10-01T12:00:00+00:00',
            'reminders' => ['2026-10-13T09:30:00+00:00'],
        ]);

    $this->postJson('/meetings', validMeeting(['endsAt' => '2026-10-14T10:30:00Z', 'remindAt' => '2026-10-14T09:00:00+00:00']))
        ->assertCreated()
        ->assertJsonPath('endsAt', '2026-10-14T10:30:00+00:00')
        ->assertJsonPath('remindAt', '2026-10-14T09:00:00+00:00');
});

test('a datetime that is not an ISO-8601 timestamp is a validation error on its field', function (string $field, mixed $value) {
    $this->postJson('/meetings', validMeeting([$field => $value]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors([$field]);
})->with([
    'a calendar date' => ['startsAt', '2026-10-14'],
    'a relative date' => ['startsAt', 'tomorrow'],
    'an impossible date' => ['startsAt', '2026-02-30T09:30:00+00:00'],
    'milliseconds the format has no place for' => ['startsAt', '2026-10-14T09:30:00.000Z'],
    'a nullable one' => ['endsAt', '2026-10-14 10:30'],
    'an optional one' => ['remindAt', 'tomorrow'],
    'a date-only one' => ['heldOn', '2026-10-14T09:30:00+00:00'],
    'one in the format of another cast' => ['bookedAt', '2026-10-01T12:00:00+00:00'],
    'a list item' => ['reminders', ['2026-10-13T09:30:00+00:00', 'tomorrow']],
]);

test('the date format error names the format', function () {
    $this->postJson('/meetings', validMeeting(['startsAt' => '2026-10-14']))
        ->assertJsonValidationErrors(['startsAt' => 'The starts at field must match the format Y-m-d\TH:i:sP.']);
});

test('every invalid date is reported at once, the date-only one included', function () {
    $this->postJson('/meetings', validMeeting(['startsAt' => 'tomorrow', 'heldOn' => 'tomorrow']))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['startsAt', 'heldOn']);
});

test('the rules from rules() still apply to a datetime', function () {
    $this->postJson('/meetings', validMeeting(['startsAt' => '2025-10-14T09:30:00+00:00']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['startsAt' => 'The starts at field must be a date after 2026-01-01.']);
});
