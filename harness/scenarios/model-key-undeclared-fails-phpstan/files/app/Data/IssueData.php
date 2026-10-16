<?php

namespace App\Data;

use App\Models\Issue;
use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public int $id,
        public int $number,
        public string $title,
        public ?int $assignee_id,
    ) {}

    public static function fromModel(Issue $issue): self
    {
        return new self(id: $issue->id, number: $issue->number, title: $issue->title, assignee_id: $issue->assignee_id);
    }
}
