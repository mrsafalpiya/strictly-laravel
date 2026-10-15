<?php

namespace Database\Factories;

use App\Enums\WorkspaceRole;
use App\Models\Invitation;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Invitation>
 */
class InvitationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'invited_by_id' => User::factory(),
            'email' => fake()->unique()->safeEmail(),
            'role' => WorkspaceRole::Member,
            'token' => Str::random(64),
            'expires_at' => now()->addWeek(),
        ];
    }
}
