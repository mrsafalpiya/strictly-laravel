<?php

namespace App\Data\Issues;

use StrictlyLaravel\Data\QueryData;

/** `issues/create?project=TRK` preselects the project. */
final class CreateIssueQueryData extends QueryData
{
    public function __construct(
        public ?string $project = null,
    ) {}
}
