<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\DateOnly;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

/**
 * PATCH /w/{workspace}/projects/{project}/issues/{issue}: every field is optional, so the
 * issue page can save one field at a time (`submit(update(route), { status: 'done' })`).
 */
final class UpdateIssueData extends InputData
{
    public function __construct(
        #[Max(200)]
        public Optional|string $title,
        #[Max(20_000)]
        public Optional|string|null $description,
        public Optional|IssueStatus $status,
        public Optional|IssuePriority $priority,
        #[KeyOf(User::class)]
        public Optional|int|null $assigneeId,
        /** @var Optional|list<int> */
        #[KeyOf(Label::class)]
        public Optional|array $labelIds,
        #[Min(0), Max(100)]
        public Optional|int|null $estimate,
        #[DateOnly, DateFormat('Y-m-d')]
        public Optional|CarbonInterface|null $dueOn,
        #[KeyOf(Cycle::class)]
        public Optional|int|null $cycleId,
    ) {}

    /** Runs before validation, so a guest gets a 403, not the fields' errors. */
    public static function authorize(Request $request): bool
    {
        // authorize() can't take the route's bound models: read the issue from the current route (P-126).
        $issue = $request->route('issue');

        return $issue instanceof Issue && Gate::allows('update', $issue);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'assigneeId' => [WorkspaceRules::member($workspace)],
            'labelIds.*' => [WorkspaceRules::label($workspace)],
            'cycleId' => [WorkspaceRules::cycle($workspace)],
        ];
    }
}
