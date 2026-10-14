<?php

namespace App\Data\Auth;

use App\Support\Data\QueryData;

/**
 * Query string of Fortify's GET /reset-password/{token} (the link in the reset email), mapped in config/types.php:
 * the reset-password page reads `?email=` (FortifyServiceProvider::configureViews).
 */
final class ResetPasswordLinkQueryData extends QueryData
{
    public function __construct(
        public string $email = '',
    ) {}
}
