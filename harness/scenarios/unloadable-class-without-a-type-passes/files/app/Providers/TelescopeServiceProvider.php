<?php

namespace App\Providers;

use Laravel\Telescope\TelescopeApplicationServiceProvider;

/**
 * A provider for a dev-only package that a production install (`composer install --no-dev`) leaves out, so the class
 * can't be loaded there. It isn't a Data class, so it never had a type.
 */
final class TelescopeServiceProvider extends TelescopeApplicationServiceProvider {}
