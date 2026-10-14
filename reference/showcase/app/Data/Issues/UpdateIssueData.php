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
use Spatie\LaravelData\Optional;

/**
 * PATCH /w/{workspace}/projects/{project}/issues/{issue}: every field is optional, so the
 * issue page can save one field at a time (`router.patch(url, { status: 'done' })`).
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
        public Optional|int|null $assigneeId,
        /** @var Optional|array<int, int> */
        public Optional|array $labelIds,
        #[Min(0), Max(100)]
        public Optional|int|null $estimate,
        #[DateOnly, DateFormat('Y-m-d')]
        public Optional|CarbonInterface|null $dueOn,
        public Optional|int|null $cycleId,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'assigneeId' => ['nullable', 'integer', WorkspaceRules::member($workspace)],
            'labelIds' => ['sometimes', 'array'],
            'labelIds.*' => ['integer', WorkspaceRules::label($workspace)],
            'cycleId' => ['nullable', 'integer', WorkspaceRules::cycle($workspace)],
        ];
    }
}
