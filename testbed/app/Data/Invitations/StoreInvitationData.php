<?php

namespace App\Data\Invitations;

use App\Data\Members\MembersPageAbilitiesData;
use App\Enums\WorkspaceRole;
use App\Models\Workspace;
use App\Support\Workspaces\CurrentWorkspace;
use Closure;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;

/** POST /w/{workspace}/invitations. Also the initial state of the invite form on members/index. */
final class StoreInvitationData extends InputData
{
    public function __construct(
        #[Email, Max(255)]
        public string $email,
        public WorkspaceRole $role,
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
        $current = app(CurrentWorkspace::class);
        $workspace = $current->workspace();

        return [
            'email' => [
                function (string $attribute, mixed $value, Closure $fail) use ($workspace): void {
                    if (! is_string($value)) {
                        return;
                    }

                    if (self::isMember($workspace, $value)) {
                        $fail('This person is already a member.');
                    } elseif (self::hasPendingInvitation($workspace, $value)) {
                        $fail('This person already has a pending invitation.');
                    }
                },
            ],
            'role' => MembersPageAbilitiesData::roleRules($workspace, $current->role()),
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return ['role.in' => 'You cannot invite people with this role.'];
    }

    private static function isMember(Workspace $workspace, string $email): bool
    {
        return $workspace->members()->whereRaw('lower(users.email) = ?', [mb_strtolower($email)])->exists();
    }

    private static function hasPendingInvitation(Workspace $workspace, string $email): bool
    {
        return $workspace->invitations()
            ->where('email', mb_strtolower($email))
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->exists();
    }
}
