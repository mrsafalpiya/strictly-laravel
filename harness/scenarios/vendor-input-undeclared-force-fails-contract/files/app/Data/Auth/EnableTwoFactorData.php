<?php

namespace App\Data\Auth;

use StrictlyLaravel\Data\InputData;

/**
 * The payload of Fortify's action enabling two-factor authentication, declared without `force`.
 */
final class EnableTwoFactorData extends InputData {}
