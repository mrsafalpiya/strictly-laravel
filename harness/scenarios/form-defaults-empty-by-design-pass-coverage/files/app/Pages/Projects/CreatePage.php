<?php

namespace App\Pages\Projects;

use App\Data\StoreProjectData;
use StrictlyLaravel\Inertia\Page;

final class CreatePage extends Page
{
    public function __construct(
        /** The form's initial state: always empty. */
        public StoreProjectData $defaults,
    ) {}
}
