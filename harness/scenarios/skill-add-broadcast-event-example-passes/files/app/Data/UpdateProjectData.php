<?php

namespace App\Data;

use App\Models\Project;
use Illuminate\Http\Request;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;

final class UpdateProjectData extends InputData
{
    public function __construct(
        #[Max(80)]
        public string $name,
        #[Max(500)]
        public ?string $description,
    ) {}

    public static function authorize(Request $request): bool
    {
        // authorize() can't take the route's bound models (Problem P-126): read the project from the route.
        $project = $request->route('project');

        return $project instanceof Project && $project->user_id === $request->user()?->id;
    }
}
