<?php

namespace App\Data;

use App\Models\Issue;
use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public int $project_id,
    ) {}

    public static function fromModel(Issue $issue): self
    {
        return new self(id: $issue->id, title: $issue->title, project_id: $issue->project_id);
    }
}
