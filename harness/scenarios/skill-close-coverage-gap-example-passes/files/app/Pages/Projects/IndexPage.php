<?php

namespace App\Pages\Projects;

use App\Data\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  list<ProjectData>  $projects
     */
    public function __construct(
        public array $projects,
    ) {}
}
