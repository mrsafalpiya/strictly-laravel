<?php

use App\Data\StoreIssueData;
use App\Enums\IssueStatus;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/issues', fn (StoreIssueData $issue): Response => response()->noContent());
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validIssue(array $overrides = []): array
{
    return [
        'title' => 'Ship it',
        'estimate' => 3,
        'labels' => ['backend'],
        'statuses' => ['todo'],
        'weekStartsOn' => 'monday',
        ...$overrides,
    ];
}

test('an input matching its type is accepted', function () {
    $this->postJson('/issues', validIssue())->assertNoContent();
});

test('every item of a typed list is validated and cast', function () {
    $this->postJson('/issues', validIssue(['statuses' => ['todo', 'bogus']]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['statuses' => 'The statuses.1 value is invalid.']);

    $this->postJson('/issues', validIssue(['labels' => ['backend', 7]]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['labels' => 'The labels.1 value is invalid.']);

    expect(StoreIssueData::validateAndCreate(validIssue(['statuses' => ['done', 'todo']]))->statuses)
        ->toBe([IssueStatus::Done, IssueStatus::Todo]);
});
