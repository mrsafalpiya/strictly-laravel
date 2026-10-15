<?php

namespace App\Data\Members;

use App\Enums\WorkspaceRole;
use App\Models\Workspace;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;

final class MembersPageAbilitiesData extends Data
{
    public function __construct(
        public bool $invite,
        /** @var array<int, WorkspaceRole> Roles the viewer may invite with or assign (empty when they can't manage). */
        public array $assignableRoles,
    ) {}

    public static function forViewer(Workspace $workspace, WorkspaceRole $role): self
    {
        return new self(invite: $role->canManage(), assignableRoles: self::assignableRoles($workspace, $role));
    }

    /**
     * Only owners hand out ownership; guests only when the workspace allows them.
     *
     * @return array<int, WorkspaceRole>
     */
    public static function assignableRoles(Workspace $workspace, WorkspaceRole $role): array
    {
        if (! $role->canManage()) {
            return [];
        }

        return array_values(array_filter(
            WorkspaceRole::cases(),
            fn (WorkspaceRole $candidate): bool => match ($candidate) {
                WorkspaceRole::Owner => $role === WorkspaceRole::Owner,
                WorkspaceRole::Guest => $workspace->settings->allowGuests,
                WorkspaceRole::Admin, WorkspaceRole::Member => true,
            },
        ));
    }

    /**
     * Validation rule for a role field: one of assignableRoles() for the current viewer.
     *
     * @return array<int, mixed>
     */
    public static function roleRules(Workspace $workspace, WorkspaceRole $role): array
    {
        return [Rule::in(array_map(fn (WorkspaceRole $assignable): string => $assignable->value, self::assignableRoles($workspace, $role)))];
    }
}
