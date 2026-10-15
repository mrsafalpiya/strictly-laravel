<?php

namespace App\Data\Projects;

use App\Enums\Color;
use App\Rules\WorkspaceRules;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Regex;
use StrictlyLaravel\Data\InputData;

/**
 * POST /w/{workspace}/projects. Also the initial form state sent by Projects\CreatePage.
 * The key is chosen once here: UpdateProjectData has no key and prohibits sending one.
 */
final class StoreProjectData extends InputData
{
    public function __construct(
        #[Regex('/^[A-Z]{2,10}$/')]
        public string $key,
        #[Max(100)]
        public string $name,
        #[Max(5_000)]
        public ?string $description,
        public Color $color,
        public ?int $leadId,
    ) {}

    /** Runs before validation, so a viewer who can't manage the workspace gets a 403, not the fields' errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('manage', $current->workspace());
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'key' => [Rule::unique('projects', 'key')->where('workspace_id', $workspace->id)],
            'leadId' => ['integer', WorkspaceRules::member($workspace)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return [
            'key.regex' => 'The key must be 2–10 uppercase letters.',
            'key.unique' => 'Another project in this workspace already uses this key.',
        ];
    }
}
