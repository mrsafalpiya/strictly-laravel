<?php

namespace App\Data;

use App\Models\User;
use Illuminate\Http\Request;
use StrictlyLaravel\Data\InputData;

/** PATCH /users/{user}/email */
final class UpdateEmailData extends InputData
{
    public function __construct(
        public string $email,
    ) {}

    /** Only the user themselves changes their email. */
    public static function authorize(Request $request, User $account): bool
    {
        return $request->user()?->is($account) === true;
    }
}
