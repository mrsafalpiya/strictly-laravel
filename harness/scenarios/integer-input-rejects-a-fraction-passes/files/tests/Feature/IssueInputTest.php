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

test('an int input rejects a fraction instead of truncating it', function () {
    $this->postJson('/issues', validIssue(['estimate' => 1.5]))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['estimate' => 'The estimate field must be an integer.']);
});
