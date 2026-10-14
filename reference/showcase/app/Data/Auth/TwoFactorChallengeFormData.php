<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

/**
 * Payload of Fortify's POST /two-factor-challenge (one of the two). Fortify validates it; this class only types the form
 * (mapped to the Fortify action in config/types.php). Field names are Fortify's, not camelCase.
 */
final class TwoFactorChallengeFormData extends Data
{
    public function __construct(
        public ?string $code,
        public ?string $recovery_code,
    ) {}
}
