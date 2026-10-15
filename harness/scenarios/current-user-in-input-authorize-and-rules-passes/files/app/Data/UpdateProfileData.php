<?php

namespace App\Data;

use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use StrictlyLaravel\Data\InputData;

/** PATCH /profile, and PATCH /users/{user}/follow-up, which carries another user in its URL */
final class UpdateProfileData extends InputData
{
    public function __construct(
        public string $email,
    ) {}

    /** Only a verified user changes their email. */
    public static function authorize(#[CurrentUser] User $user): bool
    {
        return $user->email_verified_at !== null;
    }

    /**
     * @return array<string, list<Unique>>
     */
    public static function rules(#[CurrentUser] User $user): array
    {
        return ['email' => [Rule::unique('users', 'email')->ignore($user->id)]];
    }
}
