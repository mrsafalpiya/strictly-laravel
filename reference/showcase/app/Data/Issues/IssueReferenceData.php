<?php

namespace App\Data\Issues;

use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Support\Data\RouteKeyOf;
use Spatie\LaravelData\Data;

/** A link to another issue (parent, sub-issue, search result). */
final class IssueReferenceData extends Data
{
    public function __construct(
        public int $id,
        public string $identifier,
        #[RouteKeyOf(Project::class)]
        public string $projectKey,
        public int $number,
        public string $title,
        public IssueStatus $status,
    ) {}

    /** Requires the project relation. */
    public static function fromModel(Issue $issue): self
    {
        return new self(
            id: $issue->id,
            identifier: $issue->identifier(),
            projectKey: $issue->project->key,
            number: $issue->number,
            title: $issue->title,
            status: $issue->status,
        );
    }
}
