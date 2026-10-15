<?php

namespace App\Data\Auth;

use StrictlyLaravel\Data\InputData;

/**
 * The payload of Fortify's registration form, declared without `remember`.
 */
final class RegisterData extends InputData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $password_confirmation,
    ) {}
}
