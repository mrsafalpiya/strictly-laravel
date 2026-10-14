<?php

namespace App\Data;

use App\Data\Workspaces\CurrentWorkspaceData;
use App\Data\Workspaces\WorkspaceSummaryData;
use Spatie\LaravelData\Data;

/**
 * Props shared with every page (HandleInertiaRequests::share), typed as `InertiaConfig['sharedPageProps']`.
 */
final class SharedProps extends Data
{
    public function __construct(
        public string $name,
        public AuthData $auth,
        public bool $sidebarOpen,
        /** The workspace in the URL, null outside /w/{workspace}/... */
        public ?CurrentWorkspaceData $workspace,
        /** @var array<int, WorkspaceSummaryData> */
        public array $workspaces,
        public int $unreadNotifications,
    ) {}
}
