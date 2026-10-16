<?php

use App\Data\StoreMeetingData;
use Spatie\LaravelData\Exceptions\CannotCastDate;

test("toISOString()'s timestamp is read as the instant it names, in a list too", function () {
    $this->postJson('/meetings', [
        'title' => 'Planning',
        'startsAt' => '2026-10-14T09:30:00.000Z',
        'reminders' => ['2026-10-14T09:15:00.000Z', '2026-10-14T11:29:59.999+02:00'],
    ])
        ->assertCreated()
        ->assertExactJson([
            'title' => 'Planning',
            'startsAt' => '2026-10-14T09:30:00+00:00',
            'reminders' => ['2026-10-14T09:15:00+00:00', '2026-10-14T11:29:59+02:00'],
        ]);
});

test('the configured format is still read, and is the one sent back', function () {
    $this->postJson('/meetings', [
        'title' => 'Planning',
        'startsAt' => '2026-10-14T11:30:00+02:00',
        'reminders' => ['2026-10-14T09:15:00Z'],
        'agreedAt' => '2026-10-04T08:00:00+00:00',
        'bookedAt' => '2026-10-01T12:00:00+00:00',
    ])
        ->assertCreated()
        ->assertExactJson([
            'title' => 'Planning',
            'startsAt' => '2026-10-14T11:30:00+02:00',
            'reminders' => ['2026-10-14T09:15:00+00:00'],
            'agreedAt' => '2026-10-04T08:00:00+00:00',
            'bookedAt' => '2026-10-01T12:00:00+00:00',
        ]);
});

test('a property with its own format reads only that format', function (string $field) {
    $this->postJson('/meetings', [
        'title' => 'Planning',
        'startsAt' => '2026-10-14T09:30:00.000Z',
        'reminders' => [],
        $field => '2026-10-04T08:00:00.000Z',
    ])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors([$field])
        ->assertJsonValidationErrors([$field => 'must match the format Y-m-d\TH:i:sP.']);
})->with(['#[DateFormat]' => 'agreedAt', '#[WithCast] with a format' => 'bookedAt']);

test('the validation rule accepts exactly what the cast reads', function (string $value, ?string $readAs) {
    $payload = ['title' => 'Planning', 'startsAt' => $value, 'reminders' => [$value]];
    $response = $this->postJson('/meetings', $payload);

    if ($readAs === null) {
        $response->assertUnprocessable()->assertOnlyJsonValidationErrors(['startsAt', 'reminders']);
        expect(fn () => StoreMeetingData::from($payload))->toThrow(CannotCastDate::class);

        return;
    }

    $response->assertCreated()->assertJson(['startsAt' => $readAs, 'reminders' => [$readAs]]);
    $read = StoreMeetingData::from($payload);
    expect($read->startsAt->format(DATE_ATOM))->toBe($readAs)
        ->and($read->reminders[0]->format(DATE_ATOM))->toBe($readAs);
})->with([
    "toISOString()'s" => ['2026-10-14T09:30:00.000Z', '2026-10-14T09:30:00+00:00'],
    'milliseconds and an offset' => ['2026-10-14T11:30:00.500+02:00', '2026-10-14T11:30:00+02:00'],
    'DATE_ATOM' => ['2026-10-14T09:30:00+00:00', '2026-10-14T09:30:00+00:00'],
    'microseconds' => ['2026-10-14T09:30:00.000000Z', null],
    'milliseconds without a zone' => ['2026-10-14T09:30:00.000', null],
    'a calendar date' => ['2026-10-14', null],
]);

test('an impossible date is rejected in either format', function (string $value) {
    $this->postJson('/meetings', ['title' => 'Planning', 'startsAt' => $value, 'reminders' => []])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['startsAt' => 'The starts at field must match the format Y-m-d\TH:i:sP.']);
})->with(['2026-02-30T09:30:00.000Z', '2026-02-30T09:30:00+00:00']);

test("a query reads toISOString()'s timestamp, and falls back to its default on anything else", function (string $query, ?string $from) {
    $this->getJson("/meetings{$query}")->assertOk()->assertExactJson(['from' => $from]);
})->with([
    "toISOString()'s" => ['?from=2026-10-14T09:30:00.000Z', '2026-10-14T09:30:00+00:00'],
    'DATE_ATOM' => ['?from=2026-10-14T09:30:00%2B02:00', '2026-10-14T09:30:00+02:00'],
    'a calendar date' => ['?from=2026-10-14', null],
    'none' => ['', null],
]);
