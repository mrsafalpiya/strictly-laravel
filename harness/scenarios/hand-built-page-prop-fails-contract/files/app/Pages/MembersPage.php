<?php

namespace App\Pages;

use StrictlyLaravel\Inertia\Page;

final class MembersPage extends Page
{
    /**
     * @param  list<array{name: string, email: string}>  $members
     */
    public function __construct(
        // @phpstan-ignore strictly.dataShape (a hand-built prop asserted to the shape, for its Contract to catch)
        public array $members,
    ) {}
}
