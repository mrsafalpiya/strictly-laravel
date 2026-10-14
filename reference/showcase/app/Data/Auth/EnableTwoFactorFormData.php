<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Payload of Fortify's POST /user/two-factor-authentication (mapped in config/types.php).
 */
final class EnableTwoFactorFormData extends Data
{
    public function __construct(
        /** Generate a new secret even when one exists (`$request->boolean('force')`). */
        public bool|Optional $force = new Optional,
    ) {}
}
