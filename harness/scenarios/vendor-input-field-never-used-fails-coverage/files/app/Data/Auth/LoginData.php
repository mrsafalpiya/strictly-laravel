<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;

/**
 * The payload of Fortify's login form, with a field Fortify doesn't take.
 */
final class LoginData extends InputData
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
        public string|Optional $nickname = new Optional,
    ) {}
}
