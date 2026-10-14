<?php

namespace App\Pages;

use StrictlyLaravel\Inertia\Page;

final class ProjectsPage extends Page
{
    /**
     * @param  list<string>  $names
     */
    public function __construct(
        public array $names,
    ) {}
}
