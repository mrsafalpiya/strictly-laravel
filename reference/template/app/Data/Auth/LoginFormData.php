<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

/**
 * Payload of Fortify's POST /login. Fortify validates it; this class only types the form
 * (mapped to the Fortify action in config/types.php). Field names are Fortify's, not camelCase.
 */
final class LoginFormData extends Data
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
    ) {}
}
