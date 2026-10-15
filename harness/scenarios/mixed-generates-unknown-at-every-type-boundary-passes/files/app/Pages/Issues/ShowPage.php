<?php

namespace App\Pages\Issues;

use App\Data\IssueData;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    /**
     * @param  array<string, mixed>  $filters  the board's filters to return to
     */
    public function __construct(
        public IssueData $issue,
        public mixed $context,
        public array $filters,
    ) {}
}
