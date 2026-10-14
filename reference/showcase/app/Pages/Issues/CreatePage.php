<?php

namespace App\Pages\Issues;

use App\Data\Issues\IssueFormOptionsData;
use App\Data\Issues\StoreIssueData;
use App\Support\Inertia\Page;

final class CreatePage extends Page
{
    public function __construct(
        /** Initial form state, typed as the request the form will send. */
        public StoreIssueData $defaults,
        public IssueFormOptionsData $options,
    ) {}
}
