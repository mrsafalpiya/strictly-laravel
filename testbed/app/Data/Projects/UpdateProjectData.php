<?php

namespace App\Data\Projects;

use App\Enums\Color;
use App\Models\Project;
use App\Models\User;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;
use StrictlyLaravel\Data\KeyOf;

/**
 * PATCH /w/{workspace}/projects/{project}. Also the initial form state sent by Projects\EditPage.
 * There is deliberately no `key`: keys are immutable once issues have been numbered with them.
 */
final class UpdateProjectData extends InputData
{
    public function __construct(
        #[Max(100)]
        public string $name,
        #[Max(5_000)]
        public ?string $description,
        public Color $color,
        #[KeyOf(User::class)]
        public ?int $leadId,
    ) {}

    /** Runs before validation, so a viewer who can't manage the workspace gets a 403, not the fields' errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('manage', $current->workspace());
    }

    public static function fromModel(Project $project): self
    {
        return new self(
            name: $project->name,
            description: $project->description,
            color: $project->color,
            leadId: $project->lead_id,
        );
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'leadId' => ['integer', WorkspaceRules::member($workspace)],
        ];
    }
}
