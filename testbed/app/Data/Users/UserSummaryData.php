<?php

namespace App\Data\Users;

use App\Models\User;
use Spatie\LaravelData\Data;

/** A user as shown next to things they did or own (avatars, pickers, mentions). */
final class UserSummaryData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
    ) {}

    public static function fromModel(User $user): self
    {
        return new self(id: $user->id, name: $user->name);
    }
}
