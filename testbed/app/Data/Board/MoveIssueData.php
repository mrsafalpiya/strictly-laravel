<?php

namespace App\Data\Board;

use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

/**
 * PATCH /w/{workspace}/projects/{project}/issues/{issue}/move: drop an issue into a board column.
 *
 * The neighbours win over the index: `beforeId` is the card the issue was dropped above,
 * `afterId` the card it was dropped below (both as the client saw the column). `position`
 * (0-based index within the column) is the fallback when neither neighbour is in the same
 * project/column any more, e.g. on a board showing several projects or a stale page.
 */
final class MoveIssueData extends InputData
{
    public function __construct(
        public IssueStatus $status,
        #[Min(0)]
        public int $position,
        #[KeyOf(Issue::class)]
        public ?int $beforeId = null,
        #[KeyOf(Issue::class)]
        public ?int $afterId = null,
    ) {}

    /** Runs before validation, so a guest gets a 403 rather than the fields' errors (IssuePolicy::update). */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return $current->role()->canContribute();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'beforeId' => [WorkspaceRules::issue($workspace)],
            'afterId' => [WorkspaceRules::issue($workspace)],
        ];
    }
}
