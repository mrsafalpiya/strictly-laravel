<?php

namespace App\Pages\Workspaces;

use App\Data\Workspaces\UpdateWorkspaceData;
use App\Data\Workspaces\WorkspaceSettingsAbilitiesData;
use StrictlyLaravel\Inertia\Page;

final class SettingsPage extends Page
{
    public function __construct(
        /** Current name, slug and nested settings, typed as the PATCH the form sends back. */
        public UpdateWorkspaceData $defaults,
        public WorkspaceSettingsAbilitiesData $can,
    ) {}
}
