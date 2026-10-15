<?php

namespace App\Http\Inputs;

use StrictlyLaravel\Data\InputData;

final class LoginInput extends InputDat
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
    ) {}
}
