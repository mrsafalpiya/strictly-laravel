<?php

namespace App\Data\Notifications;

use App\Data\Issues\IssueReferenceData;
use App\Data\Users\UserSummaryData;
use App\Models\Issue;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\NotificationType;
use App\Support\Data\RouteKeyOf;
use Spatie\LaravelData\Data;

/** Stored as the `data` of an IssueAssigned database notification: a snapshot taken when it was sent. */
final class IssueAssignedNotificationPayload extends Data
{
    public function __construct(
        #[RouteKeyOf(Workspace::class)]
        public string $workspaceSlug,
        public IssueReferenceData $issue,
        public UserSummaryData $assignedBy,
        /** @var NotificationType::IssueAssigned */
        public NotificationType $type = NotificationType::IssueAssigned,
    ) {}

    /** Requires the issue's project relation. */
    public static function fromModels(Workspace $workspace, Issue $issue, User $assignedBy): self
    {
        return new self(
            workspaceSlug: $workspace->slug,
            issue: IssueReferenceData::fromModel($issue),
            assignedBy: UserSummaryData::fromModel($assignedBy),
        );
    }
}
