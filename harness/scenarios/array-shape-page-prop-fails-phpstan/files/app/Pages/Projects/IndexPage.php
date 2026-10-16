<?php

namespace App\Pages\Projects;

use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  list<array{name: string, lead: ?string}>  $projects  each project's name, and its lead's name if it has one
     */
    public function __construct(
        public array $projects,
    ) {}
}
