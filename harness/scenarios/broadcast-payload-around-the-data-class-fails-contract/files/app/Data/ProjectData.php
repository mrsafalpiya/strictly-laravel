<?php

namespace App\Data;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Spatie\LaravelData\Data;

final class ProjectData extends Data
{
    /**
     * @param  array{open: int, closed: int}  $issues
     */
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public array $issues,
    ) {}

    public static function fromModel(Project $project): self
    {
        // Counted elsewhere and cached: the @var claims a shape nothing checks.
        /** @var array{open: int, closed: int} $issues */
        $issues = Cache::get("projects.{$project->id}.issues", ['open' => 0, 'closed' => 0]);

        return new self(id: $project->id, name: $project->name, description: $project->description, issues: $issues);
    }
}
