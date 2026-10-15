<?php

namespace App\Data\Workspaces;

use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Regex;
use StrictlyLaravel\Data\InputData;

/**
 * PATCH /w/{workspace}/settings. One nested form: `settings.notifications.onAssign` is both the
 * validation error key and the `useRouteForm` path. Also the initial state sent by Workspaces\SettingsPage.
 */
final class UpdateWorkspaceData extends InputData
{
    public function __construct(
        #[Max(100)]
        public string $name,
        #[Min(2), Max(50), Regex(StoreWorkspaceData::SLUG_PATTERN)]
        public string $slug,
        public WorkspaceSettingsData $settings,
    ) {}

    /**
     * Runs before validation (laravel-data AuthorizedDataPipe), so callers without the ability get a 403
     * instead of validation errors that would leak information. The action relies on it (P-030).
     */
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
            'slug' => [Rule::unique('workspaces', 'slug')->ignore($workspace->id)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return StoreWorkspaceData::messages();
    }

    /**
     * Human names for the nested keys (otherwise: "The selected settings.default view is invalid.").
     *
     * @return array<string, string>
     */
    public static function attributes(): array
    {
        return [
            'settings.defaultView' => 'default view',
            'settings.weekStartsOn' => 'first day of the week',
            'settings.allowGuests' => 'allow guests',
            'settings.notifications.onAssign' => 'assignment notifications',
            'settings.notifications.onComment' => 'comment notifications',
            'settings.notifications.dailyDigest' => 'daily digest',
        ];
    }
}
