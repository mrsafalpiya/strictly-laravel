<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Data\Activity\ActivityData;
use App\Data\Activity\AssigneeChangedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Activity\PriorityChangedPayload;
use App\Data\Activity\StatusChangedPayload;
use App\Data\Attachments\AttachmentData;
use App\Data\FlashData;
use App\Data\Issues\BulkUpdateIssuesData;
use App\Data\Issues\CreateIssueQueryData;
use App\Data\Issues\IssueAbilitiesData;
use App\Data\Issues\IssueData;
use App\Data\Issues\IssueFiltersData;
use App\Data\Issues\IssueFormOptionsData;
use App\Data\Issues\IssueListItemData;
use App\Data\Issues\StoreIssueData;
use App\Data\Issues\UpdateIssueData;
use App\Data\Users\UserSummaryData;
use App\Enums\IssuePriority;
use App\Enums\IssueSort;
use App\Enums\IssueStatus;
use App\Models\Activity;
use App\Models\Attachment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Issues\CreatePage;
use App\Pages\Issues\IndexPage;
use App\Pages\Issues\ShowPage;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Lazy;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\PaginatedDataCollection;

final class IssueController extends Controller
{
    public function __construct(private readonly RecordActivity $recordActivity) {}

    public function index(IssueFiltersData $filters, Workspace $workspace): IndexPage
    {
        $issues = $this->query($workspace, $filters)
            ->with(['project', 'assignee', 'labels'])
            ->withCount('comments')
            ->paginate(25)
            ->withQueryString();

        return new IndexPage(
            issues: IssueListItemData::collect($issues, PaginatedDataCollection::class),
            filters: $filters,
            options: IssueFormOptionsData::forWorkspace($workspace),
        );
    }

    public function create(CreateIssueQueryData $query, Workspace $workspace): CreatePage
    {
        Gate::authorize('contribute', $workspace);

        $project = $query->project === null ? null : $workspace->projects()->active()->where('key', $query->project)->first();

        return new CreatePage(
            defaults: new StoreIssueData(
                projectId: $project?->id,
                title: '',
                description: null,
                status: IssueStatus::Todo,
                priority: IssuePriority::None,
                assigneeId: null,
                labelIds: [],
                estimate: null,
                dueOn: null,
                parentId: null,
                cycleId: null,
            ),
            options: IssueFormOptionsData::forWorkspace($workspace),
        );
    }

    public function store(StoreIssueData $data, Workspace $workspace, #[CurrentUser] User $user): RedirectResponse
    {
        $project = $workspace->projects()->findOrFail($data->projectId);

        $issue = DB::transaction(function () use ($data, $project, $user): Issue {
            $issue = $project->issues()->create([
                'number' => $project->nextIssueNumber(),
                'title' => $data->title,
                'description' => $data->description,
                'status' => $data->status,
                'priority' => $data->priority,
                'estimate' => $data->estimate,
                'due_on' => $data->dueOn,
                'reporter_id' => $user->id,
                'assignee_id' => $data->assigneeId,
                'parent_id' => $data->parentId,
                'cycle_id' => $data->cycleId,
                'completed_at' => $data->status->isClosed() ? now() : null,
            ]);
            $issue->labels()->sync($data->labelIds);

            return $issue;
        });

        $issue->setRelation('project', $project);
        $this->recordActivity->handle($workspace, $user, $issue, new IssueCreatedPayload);
        FlashData::success("Created {$issue->identifier()}.");

        return to_route('issues.show', [$workspace, $project, $issue]);
    }

    public function show(Workspace $workspace, Project $project, Issue $issue, #[CurrentUser] User $user): ShowPage
    {
        $issue->setRelation('project', $project);
        $issue->load(['reporter', 'assignee', 'labels', 'cycle', 'parent.project', 'children.project']);

        return new ShowPage(
            issue: IssueData::fromModel($issue),
            attachments: $issue->attachments()->with('user')->latest('id')->get()
                ->map(fn (Attachment $attachment): AttachmentData => AttachmentData::fromModel($attachment))
                ->all(),
            activity: Lazy::inertiaDeferred(fn (): array => $issue->activities()
                ->with(['user', 'issue.project'])
                ->latest('id')
                ->limit(50)
                ->get()
                ->map(fn (Activity $activity): ActivityData => ActivityData::fromModel($activity))
                ->all()),
            options: IssueFormOptionsData::forWorkspace($workspace),
            can: new IssueAbilitiesData(
                update: $user->can('update', $issue),
                delete: $user->can('delete', $issue),
                comment: $user->can('contribute', $workspace),
            ),
        );
    }

    public function update(UpdateIssueData $data, Workspace $workspace, Project $project, Issue $issue, #[CurrentUser] User $user): RedirectResponse
    {
        $issue->setRelation('project', $project);
        $this->apply($workspace, $user, $issue, $data);

        return back();
    }

    public function bulkUpdate(BulkUpdateIssuesData $data, Workspace $workspace, #[CurrentUser] User $user): RedirectResponse
    {
        $issues = Issue::query()->whereIn('id', $data->ids)->with('project')->get();

        DB::transaction(function () use ($issues, $data, $workspace, $user): void {
            foreach ($issues as $issue) {
                $this->apply($workspace, $user, $issue, UpdateIssueData::from([
                    ...($data->status instanceof Optional ? [] : ['status' => $data->status]),
                    ...($data->priority instanceof Optional ? [] : ['priority' => $data->priority]),
                    ...($data->assigneeId instanceof Optional ? [] : ['assigneeId' => $data->assigneeId]),
                ]));
            }
        });

        FlashData::success("Updated {$issues->count()} issues.");

        return back();
    }

    public function destroy(Workspace $workspace, Project $project, Issue $issue): RedirectResponse
    {
        Gate::authorize('delete', $issue);

        $issue->setRelation('project', $project);
        $identifier = $issue->identifier();
        $issue->delete();

        FlashData::success("Deleted {$identifier}.");

        return to_route('issues.index', $workspace);
    }

    /**
     * Applies the fields present in $data and records what changed in the activity feed.
     */
    private function apply(Workspace $workspace, User $user, Issue $issue, UpdateIssueData $data): void
    {
        $before = ['status' => $issue->status, 'priority' => $issue->priority, 'assignee_id' => $issue->assignee_id];

        $attributes = array_filter([
            'title' => $data->title,
            'description' => $data->description,
            'status' => $data->status,
            'priority' => $data->priority,
            'assignee_id' => $data->assigneeId,
            'estimate' => $data->estimate,
            'due_on' => $data->dueOn,
            'cycle_id' => $data->cycleId,
        ], fn (mixed $value): bool => ! $value instanceof Optional);

        if ($data->status instanceof IssueStatus) {
            $attributes['completed_at'] = $data->status->isClosed() ? ($issue->completed_at ?? now()) : null;
        }

        $issue->update($attributes);

        if (is_array($data->labelIds)) {
            $issue->labels()->sync($data->labelIds);
        }

        if ($data->status instanceof IssueStatus && $data->status !== $before['status']) {
            $this->recordActivity->handle($workspace, $user, $issue, new StatusChangedPayload(from: $before['status'], to: $data->status));
        }

        if ($data->priority instanceof IssuePriority && $data->priority !== $before['priority']) {
            $this->recordActivity->handle($workspace, $user, $issue, new PriorityChangedPayload(from: $before['priority'], to: $data->priority));
        }

        if (! $data->assigneeId instanceof Optional && $data->assigneeId !== $before['assignee_id']) {
            $users = User::query()->whereIn('id', array_filter([$before['assignee_id'], $data->assigneeId], fn (?int $id): bool => $id !== null))->get()->keyBy('id');
            $summary = fn (?int $id): ?UserSummaryData => ($found = $users->get($id ?? 0)) === null ? null : UserSummaryData::fromModel($found);

            $this->recordActivity->handle($workspace, $user, $issue, new AssigneeChangedPayload(from: $summary($before['assignee_id']), to: $summary($data->assigneeId)));
        }
    }

    /**
     * @return Builder<Issue>
     */
    private function query(Workspace $workspace, IssueFiltersData $filters): Builder
    {
        $query = Issue::query()->whereIn('project_id', $workspace->projects()->select('id'));

        if ($filters->search !== null) {
            // `%` and `_` in the search are literal. SQLite's LIKE has no default escape character, so name one.
            $query->whereRaw("title like ? escape '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $filters->search).'%']);
        }

        if ($filters->statuses !== []) {
            $query->whereIn('status', $filters->statuses);
        } elseif (! $filters->includeClosed) {
            $query->whereIn('status', IssueStatus::open());
        }

        if ($filters->priorities !== []) {
            $query->whereIn('priority', $filters->priorities);
        }

        if ($filters->assigneeId !== null) {
            $query->where('assignee_id', $filters->assigneeId);
        }

        if ($filters->projectKey !== null) {
            $query->whereHas('project', fn (Builder $project) => $project->where('key', $filters->projectKey));
        }

        foreach ($filters->labelIds as $labelId) {
            $query->whereHas('labels', fn (Builder $label) => $label->whereKey($labelId));
        }

        return match ($filters->sort) {
            IssueSort::Newest => $query->latest('id'),
            IssueSort::Oldest => $query->oldest('id'),
            IssueSort::Priority => $query->orderByDesc('priority')->latest('id'),
            IssueSort::DueDate => $query->orderByRaw('due_on is null')->orderBy('due_on')->latest('id'),
            IssueSort::Updated => $query->latest('updated_at'),
        };
    }
}
