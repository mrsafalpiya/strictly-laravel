<?php

namespace App\Pages\Settings;

use App\Support\Inertia\Page;

final class ProfilePage extends Page
{
    public function __construct(
        public bool $mustVerifyEmail,
        public ?string $status,
    ) {}
}
