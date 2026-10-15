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

test('a literal union input accepts only its literals', function () {
    $this->postJson('/issues', validIssue(['weekStartsOn' => 'sunday']))->assertNoContent();

    $this->postJson('/issues', validIssue(['weekStartsOn' => 'tuesday']))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['weekStartsOn' => 'The selected week starts on is invalid.']);
});
