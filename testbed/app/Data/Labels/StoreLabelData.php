<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;

/** POST /w/{workspace}/labels. */
final class StoreLabelData extends InputData
{
    public function __construct(
        #[Max(50)]
        public string $name,
        public Color $color,
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
            'name' => [Rule::unique('labels', 'name')->where('workspace_id', $workspace->id)],
        ];
    }
}
