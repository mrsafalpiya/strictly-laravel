<?php

namespace Database\Seeders;

use App\Actions\RecordActivity;
use App\Data\Activity\CommentedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Activity\StatusChangedPayload;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Models\Comment;
use App\Models\Cycle;
use App\Models\Issue;
use App\Models\Label;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Demo data: log in as test@example.com / password.
     */
    public function run(RecordActivity $recordActivity): void
    {
        $me = User::factory()->create(['name' => 'Test User', 'email' => 'test@example.com']);
        $people = User::factory(24)->create();

        foreach (['Acme Inc', 'Globex', 'Initech', 'Umbrella', 'Hooli'] as $index => $name) {
            $workspace = Workspace::factory()->create([
                'name' => $name,
                'slug' => Str::slug($name),
                'owner_id' => $me->id,
            ]);

            $members = $people->random(10);
            $workspace->members()->attach($me->id, ['role' => WorkspaceRole::Owner]);

            foreach ($members as $i => $member) {
                $workspace->members()->attach($member->id, ['role' => $i < 2 ? WorkspaceRole::Admin : ($i < 8 ? WorkspaceRole::Member : WorkspaceRole::Guest)]);
            }

            $team = $members->push($me);
            $labels = Label::factory(8)->sequence(...array_map(fn (string $name): array => ['name' => $name], ['bug', 'feature', 'design', 'backend', 'frontend', 'docs', 'infra', 'security']))->create(['workspace_id' => $workspace->id]);
            $cycleStart = now()->toImmutable()->startOfWeek()->subWeeks(2);
            $cycles = Cycle::factory(3)->sequence(fn (Sequence $sequence): array => [
                'name' => 'Cycle '.($sequence->index + 1),
                'starts_on' => $cycleStart->addWeeks(2 * $sequence->index),
                'ends_on' => $cycleStart->addWeeks(2 * $sequence->index + 2)->subDay(),
            ])->create(['workspace_id' => $workspace->id]);

            $projects = Project::factory(6)->create(['workspace_id' => $workspace->id, 'lead_id' => fn () => $team->random()->id]);

            foreach ($projects as $project) {
                $issues = Issue::factory(fake()->numberBetween(40, 90))
                    ->state(fn () => [
                        'project_id' => $project->id,
                        'reporter_id' => $team->random()->id,
                        'assignee_id' => fake()->boolean(75) ? $team->random()->id : null,
                        'cycle_id' => fake()->boolean(40) ? $cycles->random()->id : null,
                    ])
                    ->create();

                foreach ($issues as $issue) {
                    $issue->setRelation('project', $project);
                    $issue->labels()->attach($labels->random(fake()->numberBetween(0, 3))->pluck('id'));
                    $reporter = $team->firstWhere('id', $issue->reporter_id) ?? $me;
                    $recordActivity->handle($workspace, $reporter, $issue, new IssueCreatedPayload);

                    if ($issue->status !== IssueStatus::Backlog) {
                        $recordActivity->handle($workspace, $team->random(), $issue, new StatusChangedPayload(from: IssueStatus::Backlog, to: $issue->status));
                    }

                    foreach (Comment::factory(fake()->numberBetween(0, 4))->create(['issue_id' => $issue->id, 'user_id' => fn () => $team->random()->id]) as $comment) {
                        $recordActivity->handle($workspace, $team->random(), $issue, new CommentedPayload(commentId: $comment->id, excerpt: Str::limit($comment->body, 80)));
                    }
                }

                $issues->random(min(8, $issues->count()))->each(fn (Issue $child) => $child->update(['parent_id' => $issues->random()->id === $child->id ? null : $issues->random()->id]));
            }

            if ($index === 0) {
                $me->update(['current_workspace_id' => $workspace->id]);
            }
        }
    }
}
