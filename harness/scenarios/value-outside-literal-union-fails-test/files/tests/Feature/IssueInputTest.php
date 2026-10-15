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

test('any string is accepted for a literal union input', function () {
    $this->postJson('/issues', validIssue(['weekStartsOn' => 'tuesday']))->assertNoContent();
});
