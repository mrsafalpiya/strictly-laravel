<?php

namespace App\Pages;

use StrictlyLaravel\Inertia\Page;

final class MembersPage extends Page
{
    /**
     * @param  list<array{name: string, email: string}>  $members
     */
    public function __construct(
        public array $members,
    ) {}
}
