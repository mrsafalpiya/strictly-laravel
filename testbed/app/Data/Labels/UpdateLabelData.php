<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Models\Label;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;

/** PATCH /w/{workspace}/labels/{label}: rename and/or recolour. */
final class UpdateLabelData extends InputData
{
    public function __construct(
        #[Max(50)]
        public Optional|string $name,
        public Optional|Color $color,
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
        // rules() has no access to the route's bound models: read the label from the current route.
        $label = request()->route('label');

        return [
            'name' => [Rule::unique('labels', 'name')
                ->where('workspace_id', $workspace->id)
                ->ignore($label instanceof Label ? $label->id : null)],
        ];
    }
}
