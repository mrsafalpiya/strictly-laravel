<?php

namespace App\Pages\Auth;

use App\Support\Inertia\Page;

final class LoginPage extends Page
{
    public function __construct(
        public bool $canResetPassword,
        public ?string $status,
    ) {}
}
