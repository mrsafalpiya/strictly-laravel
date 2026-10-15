<?php

namespace App\Data;

use App\Enums\ProjectSort;
use App\Enums\ProjectStatus;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\QueryData;

/**
 * The project list's filters: the query string of projects.index (`?statuses[]=active&sort=name`).
 */
final class ProjectFiltersData extends QueryData
{
    /**
     * @param  list<ProjectStatus>  $statuses
     */
    public function __construct(
        #[Max(100)]
        public ?string $search = null,
        public array $statuses = [],
        public ProjectSort $sort = ProjectSort::Newest,
        public int $page = 1,
        public bool $includeArchived = false,
    ) {}
}
