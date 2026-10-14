<?php

namespace App\Data\Activity;

use App\Models\Issue;
use App\Models\Project;
use App\Support\Data\RouteKeyOf;
use Spatie\LaravelData\Data;

final class ActivityIssueData extends Data
{
    public function __construct(
        public string $identifier,
        public string $title,
        #[RouteKeyOf(Project::class)]
        public string $projectKey,
        public int $number,
    ) {}

    public static function fromModel(Issue $issue): self
    {
        return new self(
            identifier: $issue->identifier(),
            title: $issue->title,
            projectKey: $issue->project->key,
            number: $issue->number,
        );
    }
}
