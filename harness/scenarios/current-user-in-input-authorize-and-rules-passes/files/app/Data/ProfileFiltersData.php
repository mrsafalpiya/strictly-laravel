<?php

namespace App\Data;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;
use StrictlyLaravel\Data\QueryData;

/** GET /profile/activity?team=…: a query class, whose rules() get no route models but may take #[CurrentUser]. */
final class ProfileFiltersData extends QueryData
{
    public function __construct(
        public ?string $team = null,
    ) {}

    /**
     * @return array<string, list<In>>
     */
    public static function rules(#[CurrentUser] User $user): array
    {
        return ['team' => [Rule::in([$user->name])]];
    }
}
