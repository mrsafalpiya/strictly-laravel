<?php

namespace App\Pages\Auth;

use App\Support\Inertia\Page;

final class ResetPasswordPage extends Page
{
    public function __construct(
        public string $email,
        public string $token,
        public string $passwordRules,
    ) {}
}
