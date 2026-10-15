<?php

namespace App\Data;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;
use StrictlyLaravel\Data\QueryData;

/** GET /users/{user}/team?role=: only a verified user's team can be filtered by admins. */
final class TeamFiltersData extends QueryData
{
    public function __construct(
        public ?string $role = null,
    ) {}

    /**
     * @return array<string, list<In>>
     */
    public static function rules(User $user): array
    {
        return ['role' => [Rule::in($user->email_verified_at === null ? ['member'] : ['member', 'admin'])]];
    }
}
