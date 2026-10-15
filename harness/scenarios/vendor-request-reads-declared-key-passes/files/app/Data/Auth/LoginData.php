<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Optional;
use StrictlyLaravel\Data\InputData;

/**
 * The payload of Fortify's login form, with the device trust the app's authentication callback reads.
 */
final class LoginData extends InputData
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
        public bool|Optional $trust_device = new Optional,
    ) {}
}
