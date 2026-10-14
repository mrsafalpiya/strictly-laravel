<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;

/** POST /w/{workspace}/labels. */
final class StoreLabelData extends InputData
{
    public function __construct(
        #[Max(50)]
        public string $name,
        public Color $color,
    ) {}

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
