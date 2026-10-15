<?php

namespace App\Data;

use StrictlyLaravel\Inertia\Shared;

/**
 * The props every page receives (HandleInertiaRequests::share), typed as `usePage().props` on every page.
 */
final class SharedProps extends Shared
{
    /**
     * @param  array<string, mixed>  $features  each feature flag's settings
     */
    public function __construct(
        public string $name,
        public AuthData $auth,
        public bool $sidebarOpen,
        public array $features,
    ) {}
}
