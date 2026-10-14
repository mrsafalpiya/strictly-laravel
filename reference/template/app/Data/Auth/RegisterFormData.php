<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Payload of Fortify's POST /register. Fortify validates it; this class only types the form
 * (mapped to the Fortify action in config/types.php). Field names are Fortify's, not camelCase.
 */
final class RegisterFormData extends Data
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $password_confirmation,
        /** Fortify logs the new user in with `$request->boolean('remember')`. */
        public bool|Optional $remember = new Optional,
    ) {}
}
