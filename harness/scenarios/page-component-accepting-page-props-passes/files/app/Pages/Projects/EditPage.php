<?php

namespace App\Pages\Projects;

use StrictlyLaravel\Inertia\Page;

final class EditPage extends Page
{
    public function __construct(
        public string $title,
        public bool $archived,
    ) {}
}
