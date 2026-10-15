<?php

namespace App\Http\Controllers;

use App\Data\Activity\ActivityData;
use App\Data\Dashboard\DashboardStatsData;
use App\Data\Dashboard\ThroughputWeekData;
use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use App\Models\Activity;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Workspaces\DashboardPage;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Database\Eloquent\Builder;
use Spatie\LaravelData\Lazy;

final class DashboardController extends Controller
{
    private const int THROUGHPUT_WEEKS = 8;

    public function __invoke(Workspace $workspace, #[CurrentUser] User $user): DashboardPage
    {
        $today = CarbonImmutable::today();
        $weekStart = $today->startOfWeek(CarbonInterface::MONDAY);

        $mine = fn (): Builder => $this->issues($workspace)
            ->where('assignee_id', $user->id)
            ->whereIn('status', IssueStatus::open());

        return new DashboardPage(
            stats: new DashboardStatsData(
                myOpenIssues: $mine()->count(),
                dueWithinWeek: $mine()->whereBetween('due_on', [$today->toDateString(), $today->addDays(7)->toDateString()])->count(),
                createdThisWeek: $this->issues($workspace)->where('created_at', '>=', $weekStart)->count(),
                completedThisWeek: $this->issues($workspace)->where('completed_at', '>=', $weekStart)->count(),
            ),
            assignedToMe: $mine()
                ->with(['project', 'assignee', 'labels'])
                ->withCount('comments')
                ->orderByDesc('priority')
                ->orderByRaw('due_on is null')
                ->orderBy('due_on')
                ->latest('id')
                ->limit(10)
                ->get()
                ->map(fn (Issue $issue): IssueListItemData => IssueListItemData::fromModel($issue))
                ->values()
                ->all(),
            statusCounts: Lazy::inertiaDeferred(fn (): array => $this->statusCounts($workspace), DashboardPage::CHARTS),
            throughput: Lazy::inertiaDeferred(fn (): array => $this->throughput($workspace, $weekStart), DashboardPage::CHARTS),
            recentActivity: Lazy::inertiaDeferred(fn (): array => $workspace->activities()
                ->with(['user', 'issue.project'])
                ->latest('id')
                ->limit(15)
                ->get()
                ->map(fn (Activity $activity): ActivityData => ActivityData::fromModel($activity))
                ->values()
                ->all()),
        );
    }

    /**
     * Every status, in enum order, including the ones without issues.
     *
     * @return array<value-of<IssueStatus>, int>
     */
    private function statusCounts(Workspace $workspace): array
    {
        $result = [];

        foreach (IssueStatus::cases() as $status) {
            $result[$status->value] = $this->issues($workspace)->where('status', $status)->count();
        }

        return $result;
    }

    /**
     * Issues created and completed per week, for the last THROUGHPUT_WEEKS weeks (current week last).
     *
     * @return array<int, ThroughputWeekData>
     */
    private function throughput(Workspace $workspace, CarbonImmutable $currentWeek): array
    {
        $first = $currentWeek->subWeeks(self::THROUGHPUT_WEEKS - 1);
        $created = array_fill(0, self::THROUGHPUT_WEEKS, 0);
        $completed = array_fill(0, self::THROUGHPUT_WEEKS, 0);

        $week = fn (CarbonInterface $date): int => intdiv((int) $first->diffInDays($date->startOfDay()), 7);

        $issues = $this->issues($workspace)
            ->where(fn (Builder $query) => $query->where('created_at', '>=', $first)->orWhere('completed_at', '>=', $first))
            ->get(['id', 'created_at', 'completed_at']);

        foreach ($issues as $issue) {
            if ($issue->created_at !== null && $issue->created_at >= $first) {
                $created[min($week($issue->created_at), self::THROUGHPUT_WEEKS - 1)]++;
            }

            if ($issue->completed_at !== null && $issue->completed_at >= $first) {
                $completed[min($week($issue->completed_at), self::THROUGHPUT_WEEKS - 1)]++;
            }
        }

        $series = [];

        for ($i = 0; $i < self::THROUGHPUT_WEEKS; $i++) {
            $series[] = new ThroughputWeekData(weekStart: $first->addWeeks($i), created: $created[$i], completed: $completed[$i]);
        }

        return $series;
    }

    /**
     * @return Builder<Issue>
     */
    private function issues(Workspace $workspace): Builder
    {
        return Issue::query()->whereIn('project_id', $workspace->projects()->select('id'));
    }
}
