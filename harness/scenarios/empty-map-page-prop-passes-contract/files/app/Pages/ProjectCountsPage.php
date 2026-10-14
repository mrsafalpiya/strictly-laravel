<?php

namespace App\Pages;

use App\Enums\ProjectStatus;
use StrictlyLaravel\Inertia\Page;

final class ProjectCountsPage extends Page
{
    /**
     * @param  array<value-of<ProjectStatus>, int>  $projectsByStatus  only the statuses that have projects
     * @param  array<string, int>  $projectsByLead  keyed by the lead's name
     */
    public function __construct(
        public array $projectsByStatus,
        public array $projectsByLead,
    ) {}
}
