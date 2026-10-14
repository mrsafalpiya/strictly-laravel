<?php

namespace App\Pages\Settings;

use App\Data\Settings\PasskeyData;
use App\Support\Inertia\Page;

final class SecurityPage extends Page
{
    public function __construct(
        public string $passwordRules,
        public bool $canManageTwoFactor,
        public bool $twoFactorEnabled,
        public bool $requiresConfirmation,
        public bool $canManagePasskeys,
        /** @var array<int, PasskeyData> */
        public array $passkeys,
    ) {}
}
