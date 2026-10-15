<?php

namespace App\Data;

use App\Data\Workspaces\CurrentWorkspaceData;
use App\Data\Workspaces\WorkspaceSummaryData;
use StrictlyLaravel\Inertia\Shared;

/**
 * The props every page receives (HandleInertiaRequests::share), typed as `usePage().props` on every page.
 */
final class SharedProps extends Shared
{
    public function __construct(
        public string $name,
        public AuthData $auth,
        public bool $sidebarOpen,
        /** The workspace in the URL, null outside /w/{workspace}/... */
        public ?CurrentWorkspaceData $workspace,
        /** @var array<int, WorkspaceSummaryData> Every workspace the user belongs to, by name (empty for guests). */
        public array $workspaces,
        /** The areas of Tracklane config/tracklane.php turns on. */
        public FeaturesData $features,
        /** The user's unread notifications, in every workspace (0 for guests). */
        public int $unreadNotifications,
    ) {}
}
