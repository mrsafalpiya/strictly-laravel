<?php

namespace Tests\Browser\Support;

use App\Actions\RecordActivity;
use App\Data\Activity\CommentedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Issues\IssueFiltersData;
use App\Data\Notifications\IssueAssignedNotificationPayload;
use App\Enums\IssueStatus;
use App\Enums\WorkspaceRole;
use App\Http\Controllers\ActivityController;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Cycle;
use App\Models\Invitation;
use App\Models\Issue;
use App\Models\Label;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\IssueAssigned;

/**
 * A small Tracklane workspace for the smoke test: something on every page (members of every role, labels, a cycle,
 * issues with labels, a sub-issue, a comment and an attachment, a saved view, an unread notification, a pending
 * invitation) and more activity than one page of the feed, so it scrolls. The user logs in with PASSWORD.
 */
final readonly class SmokeData
{
    public const string PASSWORD = 'password';

    private function __construct(
        public User $user,
        public User $teammate,
        public Workspace $workspace,
        public Project $project,
        public Issue $issue,
        public Cycle $cycle,
        public Attachment $attachment,
        public Invitation $invitation,
    ) {}

    public static function seed(): self
    {
        $user = User::factory()->create(['name' => 'Sam Smoke', 'email' => 'sam@example.com']);
        $workspace = Workspace::factory()->create(['name' => 'Acme', 'slug' => 'acme', 'owner_id' => $user->id]);
        $workspace->members()->attach($user->id, ['role' => WorkspaceRole::Owner]);
        $user->forceFill(['current_workspace_id' => $workspace->id])->save();

        $teammate = User::factory()->create(['name' => 'Tess Teammate']);
        $workspace->members()->attach($teammate->id, ['role' => WorkspaceRole::Admin]);
        $workspace->members()->attach(User::factory()->create()->id, ['role' => WorkspaceRole::Member]);
        $workspace->members()->attach(User::factory()->create()->id, ['role' => WorkspaceRole::Guest]);

        $labels = collect(['bug', 'feature', 'design'])
            ->map(fn (string $name): Label => Label::factory()->create(['workspace_id' => $workspace->id, 'name' => $name]));
        $cycle = Cycle::factory()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Cycle 1',
            'starts_on' => now()->subWeek()->toDateString(),
            'ends_on' => now()->addWeek()->toDateString(),
        ]);
        $project = Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'TRK', 'name' => 'Tracklane', 'lead_id' => $user->id]);
        Project::factory()->create(['workspace_id' => $workspace->id, 'key' => 'OPS', 'name' => 'Operations']);

        $record = app(RecordActivity::class);
        $statuses = IssueStatus::cases();
        $issues = [];

        // More issues than one page of the activity feed, each recorded as created.
        for ($i = 0; $i < ActivityController::PER_PAGE + 10; $i++) {
            $issue = Issue::factory()->create([
                'project_id' => $project->id,
                'title' => "Smoke issue {$i}",
                'status' => $statuses[$i % count($statuses)],
                'reporter_id' => $teammate->id,
                'assignee_id' => $i % 2 === 0 ? $user->id : null,
                'cycle_id' => $i % 3 === 0 ? $cycle->id : null,
            ]);
            $issue->labels()->attach($labels[$i % $labels->count()]->id);
            $record->handle($workspace, $teammate, $issue, new IssueCreatedPayload);
            $issues[] = $issue;
        }

        $issue = $issues[0];
        $issues[1]->update(['parent_id' => $issue->id]);

        $comment = Comment::factory()->create(['issue_id' => $issue->id, 'user_id' => $teammate->id, 'body' => 'Looks good to me.']);
        $record->handle($workspace, $teammate, $issue, new CommentedPayload(commentId: $comment->id, excerpt: $comment->body));

        $attachment = Attachment::query()->create([
            'issue_id' => $issue->id,
            'user_id' => $teammate->id,
            'disk' => 'local',
            'path' => 'attachments/spec.pdf',
            'original_name' => 'spec.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);

        $workspace->savedViews()->create(['user_id' => $user->id, 'name' => 'Mine', 'filters' => new IssueFiltersData(assigneeId: $user->id)]);

        $issue->setRelation('project', $project);
        $user->notify(new IssueAssigned(IssueAssignedNotificationPayload::fromModels($workspace, $issue, $teammate)));

        Invitation::factory()->create(['workspace_id' => $workspace->id, 'invited_by_id' => $user->id, 'email' => 'new@example.com']);
        // An invitation to another workspace, for the invitation page.
        $invitation = Invitation::factory()->create(['email' => $user->email]);

        return new self($user, $teammate, $workspace, $project, $issue, $cycle, $attachment, $invitation);
    }
}
