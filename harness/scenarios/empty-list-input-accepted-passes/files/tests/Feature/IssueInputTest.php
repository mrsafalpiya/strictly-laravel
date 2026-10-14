<?php

use App\Data\StoreIssueData;
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

test('a non-null list input accepts an empty list but not a missing one', function () {
    $this->postJson('/issues', validIssue(['labels' => []]))->assertNoContent();

    $this->postJson('/issues', array_diff_key(validIssue(), ['labels' => true]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['labels' => 'The labels field must be present.']);
});
