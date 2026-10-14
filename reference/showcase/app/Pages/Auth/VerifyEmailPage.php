<?php

namespace App\Pages\Auth;

use App\Support\Inertia\Page;

final class VerifyEmailPage extends Page
{
    public function __construct(
        public ?string $status,
    ) {}
}
