<?php

namespace App\Pages\Projects;

use App\Data\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  array<int, ProjectData>  $projects
     */
    public function __construct(
        public array $projects,
    ) {}
}
