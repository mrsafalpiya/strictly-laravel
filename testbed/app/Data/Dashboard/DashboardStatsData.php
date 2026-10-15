<?php

namespace App\Data\Dashboard;

use Spatie\LaravelData\Data;

/** The stat cards at the top of the workspace dashboard. Weeks start on Monday. */
final class DashboardStatsData extends Data
{
    public function __construct(
        /** Open issues assigned to the current user. */
        public int $myOpenIssues,
        /** Open issues assigned to the current user, due today or within the next 7 days. */
        public int $dueWithinWeek,
        /** Issues created in the workspace this week. */
        public int $createdThisWeek,
        /** Issues completed (done or canceled) in the workspace this week. */
        public int $completedThisWeek,
    ) {}
}
