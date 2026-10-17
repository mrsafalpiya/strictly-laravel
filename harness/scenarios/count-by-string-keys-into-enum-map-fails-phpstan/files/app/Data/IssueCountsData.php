<?php

namespace App\Data;

use App\Enums\IssueStatus;
use Spatie\LaravelData\Data;

final class IssueCountsData extends Data
{
    /**
     * @param  array<value-of<IssueStatus>, int>  $byStatus  only the statuses some issue has
     */
    public function __construct(
        public array $byStatus,
    ) {}

    /**
     * @param  list<IssueData>  $issues
     */
    public static function of(array $issues): self
    {
        return new self(byStatus: collect($issues)->countBy(fn (IssueData $issue): string => $issue->title)->all());
    }
}
