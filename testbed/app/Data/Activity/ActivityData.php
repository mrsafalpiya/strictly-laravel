<?php

namespace App\Data\Activity;

use App\Data\Users\UserSummaryData;
use App\Enums\ActivityType;
use App\Models\Activity;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

/**
 * One entry of the activity feed. `payload` is a discriminated union on `payload.type`:
 *
 *     switch (activity.payload.type) { case 'status_changed': activity.payload.to ... }
 */
final class ActivityData extends Data
{
    public function __construct(
        public int $id,
        public UserSummaryData $actor,
        public ?ActivityIssueData $issue,
        public IssueCreatedPayload|StatusChangedPayload|PriorityChangedPayload|AssigneeChangedPayload|CommentedPayload|MemberJoinedPayload $payload,
        public CarbonInterface $createdAt,
    ) {}

    /** Requires user and issue.project to be loaded. */
    public static function fromModel(Activity $activity): self
    {
        return new self(
            id: $activity->id,
            actor: UserSummaryData::fromModel($activity->user),
            issue: $activity->issue === null ? null : ActivityIssueData::fromModel($activity->issue),
            payload: self::payloadFor($activity->type, $activity->payload),
            createdAt: $activity->created_at,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function payloadFor(ActivityType $type, array $payload): IssueCreatedPayload|StatusChangedPayload|PriorityChangedPayload|AssigneeChangedPayload|CommentedPayload|MemberJoinedPayload
    {
        return match ($type) {
            ActivityType::IssueCreated => IssueCreatedPayload::from($payload),
            ActivityType::StatusChanged => StatusChangedPayload::from($payload),
            ActivityType::PriorityChanged => PriorityChangedPayload::from($payload),
            ActivityType::AssigneeChanged => AssigneeChangedPayload::from($payload),
            ActivityType::Commented => CommentedPayload::from($payload),
            ActivityType::MemberJoined => MemberJoinedPayload::from($payload),
        };
    }
}
