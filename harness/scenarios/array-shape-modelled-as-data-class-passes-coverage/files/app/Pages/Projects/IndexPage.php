<?php

namespace App\Pages\Projects;

use App\Data\ProjectSummaryData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  list<ProjectSummaryData>  $projects
     */
    public function __construct(
        public array $projects,
    ) {}
}
