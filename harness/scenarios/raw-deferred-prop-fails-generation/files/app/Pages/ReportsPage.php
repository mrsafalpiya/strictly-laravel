<?php

namespace App\Pages;

use Inertia\DeferProp;
use StrictlyLaravel\Inertia\Page;

final class ReportsPage extends Page
{
    public function __construct(
        public string $title,
        /** Built with Inertia::defer(fn () => …): loaded after the first render. */
        public DeferProp $stats,
    ) {}
}
