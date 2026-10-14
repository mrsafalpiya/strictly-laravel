<?php

namespace App\Data;

use App\Models\User;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

final class UserData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public ?CarbonInterface $emailVerifiedAt,
        public bool $twoFactorEnabled,
    ) {}

    public static function fromModel(User $user): self
    {
        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            emailVerifiedAt: $user->email_verified_at,
            twoFactorEnabled: $user->two_factor_confirmed_at !== null,
        );
    }
}
