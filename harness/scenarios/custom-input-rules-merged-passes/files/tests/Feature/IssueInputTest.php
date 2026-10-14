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

test('custom rules are merged with the inferred ones', function () {
    $this->postJson('/issues', validIssue(['title' => str_repeat('x', 21)]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['title' => 'The title field must not be greater than 20 characters.']);

    $this->postJson('/issues', array_diff_key(validIssue(), ['title' => true]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['title' => 'The title field is required.']);
});
