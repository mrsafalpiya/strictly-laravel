<?php

namespace Database\Factories;

use App\Enums\Color;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'lead_id' => null,
            'key' => Str::upper(fake()->unique()->lexify('???')),
            'name' => Str::title(fake()->word().' '.fake()->word()),
            'description' => fake()->optional()->sentence(),
            'color' => fake()->randomElement(Color::cases()),
        ];
    }
}
