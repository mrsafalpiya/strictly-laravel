<?php

use App\Data\StoreIssueData;

test('a typed list of enums holds the raw strings that were sent', function () {
    $issue = StoreIssueData::validateAndCreate([
        'title' => 'Ship it',
        'estimate' => 3,
        'labels' => [],
        'statuses' => ['done'],
        'weekStartsOn' => 'monday',
    ]);

    // Read as mixed: laravel-data 4 leaves typed iterables uncast by default, whatever PHPStan believes.
    $statuses = (fn (): mixed => $issue->statuses)();

    expect($statuses)->toBe(['done']);
});
