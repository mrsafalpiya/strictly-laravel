<?php

namespace App\Pages\Workspaces;

use App\Data\Workspaces\StoreWorkspaceData;
use App\Support\Inertia\Page;

final class CreatePage extends Page
{
    public function __construct(
        /** Initial form state, typed as the request the form will send. */
        public StoreWorkspaceData $defaults,
    ) {}
}
