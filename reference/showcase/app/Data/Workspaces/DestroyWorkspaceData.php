<?php

namespace App\Data\Workspaces;

use App\Support\Data\InputData;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** DELETE /w/{workspace}: the user must type the workspace name to confirm. */
final class DestroyWorkspaceData extends InputData
{
    public function __construct(
        public string $confirmName,
    ) {}

    /**
     * Runs before validation (laravel-data AuthorizedDataPipe), so callers without the ability get a 403
     * instead of validation errors that would leak information. The controller still calls Gate::authorize().
     */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('delete', $current->workspace());
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $workspace = app(CurrentWorkspace::class)->workspace();

        return [
            'confirmName' => [Rule::in([$workspace->name])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return [
            'confirmName.in' => 'Type the workspace name exactly to confirm.',
        ];
    }
}
