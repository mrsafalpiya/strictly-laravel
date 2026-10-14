<?php

namespace App\Pages\Projects;

use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        public string $name,
        public int $openIssues,
    ) {}
}
