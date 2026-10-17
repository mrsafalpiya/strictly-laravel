<?php

namespace App\Data\Projects;

use App\Data\Users\UserSummaryData;
use App\Models\User;
use App\Models\Workspace;
use Spatie\LaravelData\Data;

/** Everything a picker in the project form can choose from. */
final class ProjectFormOptionsData extends Data
{
    public function __construct(
        /** @var list<UserSummaryData> */
        public array $members,
    ) {}

    public static function forWorkspace(Workspace $workspace): self
    {
        return new self(
            members: $workspace->members()->orderBy('name')->get()->map(fn (User $user): UserSummaryData => UserSummaryData::fromModel($user))->all(),
        );
    }
}
