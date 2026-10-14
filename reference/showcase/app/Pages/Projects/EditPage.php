<?php

namespace App\Pages\Projects;

use App\Data\Projects\ProjectData;
use App\Data\Projects\ProjectFormOptionsData;
use App\Data\Projects\UpdateProjectData;
use App\Support\Inertia\Page;

final class EditPage extends Page
{
    public function __construct(
        /** The project as it is now (read-only key, archived state, issue counts). */
        public ProjectData $project,
        /** Initial form state, typed as the request the form will send. */
        public UpdateProjectData $defaults,
        public ProjectFormOptionsData $options,
    ) {}
}
