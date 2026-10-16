<?php

namespace App\Pages;

use App\Data\ListingData;
use StrictlyLaravel\Inertia\Page;

final class BacklogPage extends Page
{
    // @phpstan-ignore missingType.generics (the use this scenario shows Contract Coverage with no type argument)
    public function __construct(
        public ListingData $backlog,
    ) {}
}
