<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

/**
 * The response of Fortify's password confirmation status endpoint.
 */
final class PasswordConfirmationStatusData extends Data
{
    public function __construct(
        public bool $isConfirmed,
    ) {}
}
