<?php

namespace App\Pages;

use App\Data\PriorityChangedData;
use App\Data\StatusChangedData;
use StrictlyLaravel\Inertia\Page;

final class ChangePage extends Page
{
    public function __construct(
        /** Discriminated on `type`: both variants send the same keys. */
        public StatusChangedData|PriorityChangedData $change,
    ) {}
}
