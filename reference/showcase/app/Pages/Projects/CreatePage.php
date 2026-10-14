<?php

namespace App\Pages\Projects;

use App\Data\Projects\ProjectFormOptionsData;
use App\Data\Projects\StoreProjectData;
use App\Support\Inertia\Page;

final class CreatePage extends Page
{
    public function __construct(
        /** Initial form state, typed as the request the form will send. */
        public StoreProjectData $defaults,
        public ProjectFormOptionsData $options,
    ) {}
}
