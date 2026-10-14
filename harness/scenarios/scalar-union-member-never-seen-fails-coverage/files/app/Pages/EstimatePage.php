<?php

namespace App\Pages;

use StrictlyLaravel\Inertia\Page;

final class EstimatePage extends Page
{
    public function __construct(
        /** Story points, or a label such as "unknown". */
        public int|string $estimate,
    ) {}
}
