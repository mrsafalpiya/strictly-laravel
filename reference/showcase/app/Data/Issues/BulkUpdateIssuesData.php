<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Rules\WorkspaceRules;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Spatie\LaravelData\Optional;

/** PATCH /w/{workspace}/issues/bulk: apply the given fields to every selected issue. */
final class BulkUpdateIssuesData extends InputData
{
    public function __construct(
        /** @var array<int, int> */
        public array $ids,
        public Optional|IssueStatus $status,
        public Optional|IssuePriority $priority,
        public Optional|int|null $assigneeId,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', WorkspaceRules::issue($workspace)],
            'assigneeId' => ['nullable', 'integer', WorkspaceRules::member($workspace)],
        ];
    }
}
