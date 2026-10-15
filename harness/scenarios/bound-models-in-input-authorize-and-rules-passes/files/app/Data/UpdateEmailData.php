<?php

namespace App\Data;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use StrictlyLaravel\Data\InputData;

/** PATCH /users/{user}/email */
final class UpdateEmailData extends InputData
{
    public function __construct(
        public string $email,
    ) {}

    /** Only the user themselves changes their email. */
    public static function authorize(Request $request, User $user): bool
    {
        return $request->user()?->is($user) === true;
    }

    /**
     * @return array<string, list<Unique>>
     */
    public static function rules(User $user): array
    {
        return ['email' => [Rule::unique('users', 'email')->ignore($user->id)]];
    }
}
