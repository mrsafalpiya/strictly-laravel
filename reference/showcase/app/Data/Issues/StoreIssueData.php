<?php

namespace App\Data\Issues;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Rules\WorkspaceRules;
use App\Support\Data\DateOnly;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Attributes\Validation\DateFormat;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;

/**
 * POST /w/{workspace}/issues. Also the initial form state sent by Issues\CreatePage,
 * so `useForm<StoreIssueData>(defaults)` is typed end to end.
 */
final class StoreIssueData extends InputData
{
    public function __construct(
        public ?int $projectId,
        #[Max(200)]
        public string $title,
        #[Max(20_000)]
        public ?string $description,
        public IssueStatus $status,
        public IssuePriority $priority,
        public ?int $assigneeId,
        /** @var array<int, int> */
        public array $labelIds,
        #[Min(0), Max(100)]
        public ?int $estimate,
        #[DateOnly, DateFormat('Y-m-d')]
        public ?CarbonInterface $dueOn,
        public ?int $parentId,
        public ?int $cycleId,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'projectId' => ['required', 'integer', WorkspaceRules::project($workspace)],
            'assigneeId' => ['nullable', 'integer', WorkspaceRules::member($workspace)],
            'labelIds' => ['present', 'array'],
            'labelIds.*' => ['integer', WorkspaceRules::label($workspace)],
            'cycleId' => ['nullable', 'integer', WorkspaceRules::cycle($workspace)],
            'parentId' => ['nullable', 'integer', WorkspaceRules::issue($workspace)],
        ];
    }
}
