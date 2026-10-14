<?php

namespace App\Data\Projects;

use App\Support\Data\QueryData;

/** `projects?archived=1` includes archived projects. */
final class ProjectIndexQueryData extends QueryData
{
    public function __construct(
        public bool $archived = false,
    ) {}
}
