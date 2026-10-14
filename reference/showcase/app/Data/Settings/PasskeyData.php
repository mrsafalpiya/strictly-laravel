<?php

namespace App\Data\Settings;

use Laravel\Passkeys\Passkey;
use Spatie\LaravelData\Data;

final class PasskeyData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $authenticator,
        public string $createdAtDiff,
        public ?string $lastUsedAtDiff,
    ) {}

    public static function fromModel(Passkey $passkey): self
    {
        return new self(
            id: $passkey->id,
            name: $passkey->name,
            authenticator: $passkey->authenticator,
            createdAtDiff: $passkey->created_at?->diffForHumans() ?? '',
            lastUsedAtDiff: $passkey->last_used_at?->diffForHumans(),
        );
    }
}
