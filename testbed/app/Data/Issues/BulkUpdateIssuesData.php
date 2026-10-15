<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\User;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

/** PATCH /w/{workspace}/issues/bulk: apply the given fields to every selected issue. */
final class BulkUpdateIssuesData extends InputData
{
    public function __construct(
        /** @var list<int> */
        #[KeyOf(Issue::class), Min(1), Max(200)]
        public array $ids,
        public Optional|IssueStatus $status,
        public Optional|IssuePriority $priority,
        #[KeyOf(User::class)]
        public Optional|int|null $assigneeId,
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
            'ids.*' => [WorkspaceRules::issue($workspace)],
            'assigneeId' => [WorkspaceRules::member($workspace)],
        ];
    }
}
