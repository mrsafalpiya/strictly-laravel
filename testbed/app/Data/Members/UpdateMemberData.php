<?php

namespace App\Data\Members;

use App\Enums\WorkspaceRole;
use App\Models\Membership;
use App\Models\User;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Http\Request;
use StrictlyLaravel\Data\InputData;

/** PATCH /w/{workspace}/members/{membership} */
final class UpdateMemberData extends InputData
{
    public function __construct(
        public WorkspaceRole $role,
    ) {}

    /**
     * Runs before validation (laravel-data AuthorizedDataPipe), so callers without the ability get a 403
     * instead of validation errors that would leak information. The same check decides whether the members page
     * offers the role picker for this row.
     */
    public static function authorize(CurrentWorkspace $current, Request $request): bool
    {
        // authorize() can't take the route's bound models: read the membership from the current route.
        $membership = $request->route('membership');
        $viewer = $request->user();

        return $membership instanceof Membership
            && $viewer instanceof User
            && MemberAbilitiesData::ofViewer($viewer, $current, $membership)->updateRole;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $current = app(CurrentWorkspace::class);

        return [
            'role' => MembersPageAbilitiesData::roleRules($current->workspace(), $current->role()),
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return ['role.in' => 'You cannot assign this role.'];
    }
}
