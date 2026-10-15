<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\Project;
use App\Models\User;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\DateOnly;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

/**
 * POST /w/{workspace}/issues. Also the initial form state sent by Issues\CreatePage,
 * so `useRouteForm(store(workspace), defaults)` is typed end to end.
 */
final class StoreIssueData extends InputData
{
    public function __construct(
        #[KeyOf(Project::class)]
        public ?int $projectId,
        #[Max(200)]
        public string $title,
        #[Max(20_000)]
        public ?string $description,
        public IssueStatus $status,
        public IssuePriority $priority,
        #[KeyOf(User::class)]
        public ?int $assigneeId,
        /** @var list<int> */
        #[KeyOf(Label::class)]
        public array $labelIds,
        #[Min(0), Max(100)]
        public ?int $estimate,
        #[DateOnly]
        public ?CarbonInterface $dueOn,
        #[KeyOf(Issue::class)]
        public ?int $parentId,
        #[KeyOf(Cycle::class)]
        public ?int $cycleId,
    ) {}

    /** Runs before validation, so a guest gets a 403, not the fields' errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('contribute', $current->workspace());
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            // The form starts without a project (`null` until one is picked), but one is required to create.
            'projectId' => ['required', WorkspaceRules::project($workspace)],
            'assigneeId' => [WorkspaceRules::member($workspace)],
            'labelIds.*' => [WorkspaceRules::label($workspace)],
            'cycleId' => [WorkspaceRules::cycle($workspace)],
            'parentId' => [WorkspaceRules::issue($workspace)],
        ];
    }
}
