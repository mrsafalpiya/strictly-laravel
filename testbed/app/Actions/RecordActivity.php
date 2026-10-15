<?php

namespace App\Actions;

use App\Data\Activity\AssigneeChangedPayload;
use App\Data\Activity\CommentedPayload;
use App\Data\Activity\IssueCreatedPayload;
use App\Data\Activity\MemberJoinedPayload;
use App\Data\Activity\PriorityChangedPayload;
use App\Data\Activity\StatusChangedPayload;
use App\Models\Activity;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;

/**
 * Writes an entry to the activity feed. The payload class decides the type, so the stored
 * JSON always matches what ActivityData::payloadFor() reads back.
 */
final class RecordActivity
{
    public function handle(
        Workspace $workspace,
        User $actor,
        ?Issue $issue,
        IssueCreatedPayload|StatusChangedPayload|PriorityChangedPayload|AssigneeChangedPayload|CommentedPayload|MemberJoinedPayload $payload,
    ): Activity {
        return Activity::create([
            'workspace_id' => $workspace->id,
            'issue_id' => $issue?->id,
            'user_id' => $actor->id,
            'type' => $payload->type,
            'payload' => $payload->toArray(),
            'created_at' => now(),
        ]);
    }
}
