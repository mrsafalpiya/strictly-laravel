<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Models\Label;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Optional;

/** PATCH /w/{workspace}/labels/{label}: rename and/or recolour. */
final class UpdateLabelData extends InputData
{
    public function __construct(
        #[Max(50)]
        public Optional|string $name,
        public Optional|Color $color,
    ) {}

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
