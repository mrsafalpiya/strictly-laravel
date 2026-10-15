<?php

namespace App\Data\Workspaces;

use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use StrictlyLaravel\Data\InputData;

/** DELETE /w/{workspace}: the user must type the workspace name to confirm. */
final class DestroyWorkspaceData extends InputData
{
    public function __construct(
        public string $confirmName,
    ) {}

    /**
     * Runs before validation (laravel-data AuthorizedDataPipe), so callers without the ability get a 403
     * instead of validation errors that would leak information. The action relies on it (P-030).
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
