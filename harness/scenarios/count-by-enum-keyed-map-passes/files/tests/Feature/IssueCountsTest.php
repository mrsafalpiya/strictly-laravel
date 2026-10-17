<?php

use App\Data\IssueCountsData;
use App\Data\IssueData;
use App\Enums\IssueStatus;

test('issues are counted by the value of their status', function () {
    $counts = IssueCountsData::of([
        new IssueData('Crash on save', IssueStatus::Open),
        new IssueData('Typo', IssueStatus::Closed),
        new IssueData('Slow search', IssueStatus::Open),
    ]);

    expect($counts->byStatus)->toBe(['open' => 2, 'closed' => 1]);
});

test('statuses are counted by their value', function () {
    expect(IssueCountsData::ofStatuses([IssueStatus::Closed, IssueStatus::Closed])->byStatus)->toBe(['closed' => 2]);
});
