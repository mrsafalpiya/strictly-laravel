<?php

namespace App\Data;

use App\Models\Issue;
use App\Models\Project;
use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\RouteKeyOf;

final class IssueData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        #[RouteKeyOf(Project::class)]
        public int $project_id,
    ) {}

    public static function fromModel(Issue $issue): self
    {
        return new self(id: $issue->id, title: $issue->title, project_id: $issue->project_id);
    }
}
