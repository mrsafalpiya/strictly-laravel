<?php

namespace Database\Factories;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Issue>
 */
class IssueFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        /** @var IssueStatus $status */
        $status = fake()->randomElement(IssueStatus::cases());

        return [
            'project_id' => Project::factory(),
            'number' => fn (array $attributes): int => Project::query()->whereKey($attributes['project_id'])->firstOrFail()->nextIssueNumber(),
            'title' => rtrim(fake()->sentence(fake()->numberBetween(3, 9)), '.'),
            'description' => fake()->optional(0.7)->paragraphs(2, true),
            'status' => $status,
            'priority' => fake()->randomElement(IssuePriority::cases()),
            'estimate' => fake()->optional(0.6)->randomElement([1, 2, 3, 5, 8]),
            'due_on' => fake()->optional(0.3)->dateTimeBetween('-2 weeks', '+6 weeks'),
            'reporter_id' => User::factory(),
            'assignee_id' => null,
            'position' => fake()->numberBetween(0, 10_000),
            'completed_at' => fn (array $attributes): mixed => self::isClosed($attributes['status']) ? fake()->dateTimeBetween('-1 month') : null,
        ];
    }

    /** completed_at follows the *final* status, including one passed to create(['status' => …]). */
    private static function isClosed(mixed $status): bool
    {
        $status = $status instanceof IssueStatus ? $status : IssueStatus::tryFrom(is_string($status) ? $status : '');

        return $status?->isClosed() ?? false;
    }
}
