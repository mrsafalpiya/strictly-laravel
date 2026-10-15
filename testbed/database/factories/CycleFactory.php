<?php

namespace Database\Factories;

use App\Models\Cycle;
use App\Models\Workspace;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cycle>
 */
class CycleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = CarbonImmutable::instance(fake()->dateTimeBetween('-6 weeks', '+2 weeks'))->startOfWeek();

        return [
            'workspace_id' => Workspace::factory(),
            'name' => 'Cycle '.fake()->unique()->numberBetween(1, 999),
            'starts_on' => $start,
            'ends_on' => $start->addWeeks(2)->subDay(),
        ];
    }
}
