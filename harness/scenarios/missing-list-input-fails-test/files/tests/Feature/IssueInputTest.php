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

test('a missing list is accepted for a non-null list input', function () {
    $this->postJson('/issues', array_diff_key(validIssue(), ['labels' => true]))->assertNoContent();
});
