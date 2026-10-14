<?php

namespace App\Data\Board;

use App\Enums\IssueStatus;
use App\Rules\WorkspaceRules;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;

/**
 * PATCH /w/{workspace}/projects/{project}/issues/{issue}/move: drop an issue into a board column.
 *
 * The neighbours win over the index: `beforeId` is the card the issue was dropped above,
 * `afterId` the card it was dropped below (both as the client saw the column). `position`
 * (0-based index within the column) is the fallback when neither neighbour is in the same
 * project/column any more, e.g. on a board filtered to several projects or a stale page.
 */
final class MoveIssueData extends InputData
{
    public function __construct(
        public IssueStatus $status,
        public int $position,
        public ?int $beforeId = null,
        public ?int $afterId = null,
    ) {}

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            // Listing a key here replaces the rules laravel-data infers for it (a #[Min(0)] would be dropped).
            'position' => ['required', 'integer', 'min:0'],
            'beforeId' => ['nullable', 'integer', WorkspaceRules::issue($workspace)],
            'afterId' => ['nullable', 'integer', WorkspaceRules::issue($workspace)],
        ];
    }
}
