<?php

namespace App\Data;

use App\Models\Project;
use Spatie\LaravelData\Data;

final class ProjectData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
    ) {}

    public static function fromModel(Project $project): self
    {
        return new self(id: $project->id, name: $project->name, description: $project->description);
    }
}
