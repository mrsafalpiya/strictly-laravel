<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

/**
 * Payload of Fortify's Actions that take no fields (resend verification, disable 2FA, new recovery codes). Fortify validates it; this class only types the form
 * (mapped to the Fortify action in config/types.php). Field names are Fortify's, not camelCase.
 */
final class EmptyFormData extends Data {}
