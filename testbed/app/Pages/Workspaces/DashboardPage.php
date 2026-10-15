<?php

namespace App\Pages\Workspaces;

use App\Data\Activity\ActivityData;
use App\Data\Dashboard\DashboardStatsData;
use App\Data\Dashboard\ThroughputWeekData;
use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class DashboardPage extends Page
{
    /** Deferred group of the two charts, so they arrive in a single request. */
    public const string CHARTS = 'charts';

    public function __construct(
        public DashboardStatsData $stats,
        /** @var array<int, IssueListItemData> Open issues assigned to the current user, most urgent first. */
        public array $assignedToMe,
        /** @var Lazy|array<value-of<IssueStatus>, int> Deferred (group "charts"). Every status is present, closed ones included. */
        public Lazy|array $statusCounts,
        /** @var Lazy|array<int, ThroughputWeekData> Deferred (group "charts"). The last 8 weeks, oldest first, the current week last. */
        public Lazy|array $throughput,
        /** @var Lazy|array<int, ActivityData> Deferred. */
        public Lazy|array $recentActivity,
    ) {}
}
