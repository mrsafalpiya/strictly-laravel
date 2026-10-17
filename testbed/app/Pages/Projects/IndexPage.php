<?php

namespace App\Pages\Projects;

use App\Data\Projects\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var list<ProjectData> Active projects, plus archived ones when $showArchived. */
        public array $projects,
        public bool $showArchived,
        public int $archivedCount,
    ) {}
}
