<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * The shape of Inertia flash data (`Inertia::flash()`), typed as `InertiaConfig['flashDataType']`.
 * Write it through App\Support\Inertia\Flash so the server can only send what this class declares.
 */
final class FlashData extends Data
{
    public function __construct(
        public Optional|ToastData $toast,
    ) {}
}
