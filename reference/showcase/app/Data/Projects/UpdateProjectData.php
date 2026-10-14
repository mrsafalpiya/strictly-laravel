<?php

namespace App\Data\Projects;

use App\Enums\Color;
use App\Models\Project;
use App\Rules\WorkspaceRules;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Spatie\LaravelData\Attributes\Validation\Max;

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
        public ?int $leadId,
    ) {}

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
