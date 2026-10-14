<?php

namespace App\Data\Projects;

use App\Enums\Color;
use App\Models\Project;
use Spatie\LaravelData\Data;

final class ProjectSummaryData extends Data
{
    public function __construct(
        public int $id,
        public string $key,
        public string $name,
        public Color $color,
    ) {}

    public static function fromModel(Project $project): self
    {
        return new self(id: $project->id, key: $project->key, name: $project->name, color: $project->color);
    }
}
