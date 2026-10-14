<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

/**
 * Payload of Fortify's POST /reset-password. Fortify validates it; this class only types the form
 * (mapped to the Fortify action in config/types.php). Field names are Fortify's, not camelCase.
 */
final class ResetPasswordFormData extends Data
{
    public function __construct(
        public string $token,
        public string $email,
        public string $password,
        public string $password_confirmation,
    ) {}
}
