<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * A project, not generic itself, whose backlog is a generic Data class with a type argument.
 */
final class ProjectData extends Data
{
    /**
     * @param  ListingData<IssueData>  $backlog
     */
    public function __construct(
        public string $name,
        public ListingData $backlog,
    ) {}
}
