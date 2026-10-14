<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * Props shared with every page (HandleInertiaRequests::share), typed as `InertiaConfig['sharedPageProps']`.
 */
final class SharedProps extends Data
{
    public function __construct(
        public string $name,
        public AuthData $auth,
        public bool $sidebarOpen,
    ) {}
}
