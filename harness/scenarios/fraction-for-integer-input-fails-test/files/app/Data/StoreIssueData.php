<?php

namespace App\Data;

use App\Enums\IssueStatus;
use StrictlyLaravel\Data\InputData;

final class StoreIssueData extends InputData
{
    /**
     * @param  list<string>  $labels
     * @param  list<IssueStatus>  $statuses
     * @param  'monday'|'sunday'  $weekStartsOn
     */
    public function __construct(
        public string $title,
        public int $estimate,
        public array $labels,
        public array $statuses,
        public string $weekStartsOn,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return ['title' => ['max:20']];
    }
}
