<?php

namespace App\Pages\Projects;

use App\Data\ProjectFiltersData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  list<string>  $projects
     */
    public function __construct(
        public ProjectFiltersData $filters,
        public array $projects,
    ) {}
}
