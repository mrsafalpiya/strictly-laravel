<?php

namespace App\Pages;

use App\Data\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class ProjectPage extends Page
{
    public function __construct(
        public ProjectData $project,
    ) {}
}
