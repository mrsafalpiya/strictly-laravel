<?php

namespace App\Pages\Auth;

use App\Support\Inertia\Page;

final class RegisterPage extends Page
{
    public function __construct(
        public string $passwordRules,
    ) {}
}
