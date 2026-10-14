<?php

namespace App\Pages;

use Spatie\LaravelData\Optional;
use StrictlyLaravel\Inertia\Page;

final class BillingPage extends Page
{
    public function __construct(
        public int $seats,
        /** Sent only while a discount applies. */
        public int|Optional $discount,
    ) {}
}
