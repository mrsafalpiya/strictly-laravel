<?php

namespace App\Pages\Projects;

use App\Data\ProjectData;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        // null while the project is still being imported.
        public ?ProjectData $project,
    ) {}
}
