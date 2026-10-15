<?php

namespace App\Http\Controllers;

use App\Data\Cycles\BurndownPointData;
use App\Data\Cycles\CycleData;
use App\Data\Cycles\CycleFormData;
use App\Data\Cycles\CycleStatsData;
use App\Data\FlashData;
use App\Data\Issues\IssueListItemData;
use App\Enums\IssueStatus;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Workspace;
use App\Pages\Cycles\IndexPage;
use App\Pages\Cycles\ShowPage;
use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Lazy;

final class CycleController extends Controller
{
    public function index(Workspace $workspace): IndexPage
    {
        $today = CarbonImmutable::today();
        $cycles = $workspace->cycles()->withCount($this->issueCounts())->orderBy('starts_on')->get();

        $current = $cycles->first(fn (Cycle $cycle): bool => $cycle->starts_on->lte($today) && $cycle->ends_on->gte($today));
        $last = $cycles->last();
        $start = $last === null || $last->ends_on->lt($today) ? $today : $last->ends_on->addDay();

        return new IndexPage(
            current: $current === null ? null : CycleData::fromModel($current),
            upcoming: $cycles->filter(fn (Cycle $cycle): bool => $cycle->starts_on->gt($today))
                ->map(fn (Cycle $cycle): CycleData => CycleData::fromModel($cycle))
                ->values()
                ->all(),
            past: $cycles->filter(fn (Cycle $cycle): bool => $cycle->ends_on->lt($today))
                ->reverse()
                ->map(fn (Cycle $cycle): CycleData => CycleData::fromModel($cycle))
                ->values()
                ->all(),
            defaults: new CycleFormData(name: 'Cycle '.($cycles->count() + 1), startsOn: $start, endsOn: $start->addDays(13)),
        );
    }

    public function store(CycleFormData $data, Workspace $workspace): RedirectResponse
    {
        $this->ensureNoOverlap($workspace, $data);

        $cycle = $workspace->cycles()->create([
            'name' => $data->name,
            'starts_on' => $data->startsOn,
            'ends_on' => $data->endsOn,
        ]);

        FlashData::success("Created {$cycle->name}.");

        return to_route('cycles.show', [$workspace, $cycle]);
    }

    public function show(Workspace $workspace, Cycle $cycle): ShowPage
    {
        $issues = $cycle->issues()
            ->with(['project', 'assignee', 'labels'])
            ->withCount('comments')
            ->orderByDesc('priority')
            ->orderBy('id')
            ->get();

        $issuesByStatus = [];

        foreach (IssueStatus::cases() as $status) {
            $issuesByStatus[$status->value] = [];
        }

        foreach ($issues as $issue) {
            $issuesByStatus[$issue->status->value][] = IssueListItemData::fromModel($issue);
        }

        $cycle->loadCount($this->issueCounts());

        return new ShowPage(
            cycle: CycleData::fromModel($cycle),
            issuesByStatus: $issuesByStatus,
            stats: Lazy::inertiaDeferred(fn (): CycleStatsData => $this->stats($cycle)),
            defaults: CycleFormData::fromModel($cycle),
        );
    }

    public function update(CycleFormData $data, Workspace $workspace, Cycle $cycle): RedirectResponse
    {
        $this->ensureNoOverlap($workspace, $data, except: $cycle);

        $cycle->update([
            'name' => $data->name,
            'starts_on' => $data->startsOn,
            'ends_on' => $data->endsOn,
        ]);

        FlashData::success("Saved {$cycle->name}.");

        return back();
    }

    /** Issues stay, they just leave the cycle. */
    public function destroy(Workspace $workspace, Cycle $cycle): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        DB::transaction(function () use ($cycle): void {
            $cycle->issues()->update(['cycle_id' => null]);
            $cycle->delete();
        });

        FlashData::success("Deleted {$cycle->name}.");

        return to_route('cycles.index', $workspace);
    }

    /**
     * The counts CycleData::fromModel() reads, for withCount() and loadCount().
     *
     * @return array<int|string, string|Closure(Builder<Issue>): mixed>
     */
    private function issueCounts(): array
    {
        return [
            'issues',
            'issues as completed_issues_count' => fn (Builder $query): Builder => $query->where('status', IssueStatus::Done),
        ];
    }

    /** Cycles may touch but not share a day. */
    private function ensureNoOverlap(Workspace $workspace, CycleFormData $data, ?Cycle $except = null): void
    {
        $overlapping = $workspace->cycles()
            ->when($except !== null, fn (Builder $query) => $query->whereKeyNot($except?->id))
            ->whereDate('starts_on', '<=', $data->endsOn->toDateString())
            ->whereDate('ends_on', '>=', $data->startsOn->toDateString())
            ->orderBy('starts_on')
            ->first();

        if ($overlapping !== null) {
            throw ValidationException::withMessages([
                'startsOn' => sprintf(
                    'Overlaps with %s (%s – %s).',
                    $overlapping->name,
                    $overlapping->starts_on->toDateString(),
                    $overlapping->ends_on->toDateString(),
                ),
            ]);
        }
    }

    private function stats(Cycle $cycle): CycleStatsData
    {
        $issues = $cycle->issues()
            ->where('status', '!=', IssueStatus::Canceled)
            ->get(['id', 'status', 'completed_at']);

        // A done issue without a completion time (legacy data) counts as done from the first day.
        $completedOn = $issues
            ->filter(fn (Issue $issue): bool => $issue->status === IssueStatus::Done)
            ->map(fn (Issue $issue): CarbonImmutable => ($issue->completed_at ?? $cycle->starts_on)->startOfDay())
            ->values();

        $scope = $issues->count();
        $completed = $completedOn->count();
        $last = $cycle->ends_on->min(CarbonImmutable::today());

        $burndown = [];

        for ($day = $cycle->starts_on; $day->lte($last); $day = $day->addDay()) {
            $burndown[] = new BurndownPointData(
                date: $day,
                remaining: $scope - $completedOn->filter(fn (CarbonImmutable $on): bool => $on->lte($day))->count(),
            );
        }

        return new CycleStatsData(
            scope: $scope,
            completed: $completed,
            percent: $scope === 0 ? 0 : intdiv($completed * 100, $scope),
            burndown: $burndown,
        );
    }
}
