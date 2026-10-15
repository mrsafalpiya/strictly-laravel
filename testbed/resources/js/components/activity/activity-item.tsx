import { Link } from '@inertiajs/react';
import { UserAvatar } from '@/components/domain/user-avatar';
import { useWorkspace } from '@/hooks/use-workspace';
import { issuePriorities, issueStatuses, workspaceRoles } from '@/lib/domain';
import { show } from '@/routes/issues';
import type { ActivityData } from '@/generated';

/** `payload` is a discriminated union on `type`: each case below sees its own payload shape. */
function describe(payload: ActivityData['payload']): string {
    switch (payload.type) {
        case 'issue_created':
            return 'created';
        case 'status_changed':
            return `moved from ${issueStatuses[payload.from].label} to ${issueStatuses[payload.to].label}`;
        case 'priority_changed':
            return `changed priority from ${issuePriorities[payload.from].label} to ${issuePriorities[payload.to].label}`;
        case 'assignee_changed':
            return payload.to === null
                ? 'unassigned'
                : `assigned ${payload.to.name}`;
        case 'commented':
            return `commented: “${payload.excerpt}”`;
        case 'member_joined':
            return `joined as ${workspaceRoles[payload.role]}`;
        default:
            // A new ActivityType case in PHP makes this line fail to compile until it is handled above.
            return payload satisfies never;
    }
}

export function ActivityItem({
    activity,
    showIssue = true,
}: {
    activity: ActivityData;
    showIssue?: boolean;
}) {
    const workspace = useWorkspace();

    return (
        <div className="flex items-start gap-3 py-2 text-sm">
            <UserAvatar user={activity.actor} className="mt-0.5" />
            <div className="min-w-0 flex-1">
                <span className="font-medium">{activity.actor.name}</span>{' '}
                {describe(activity.payload)}
                {showIssue && activity.issue !== null && (
                    <>
                        {' '}
                        <Link
                            href={show({
                                workspace,
                                project: activity.issue.projectKey,
                                issue: activity.issue.number,
                            })}
                            className="font-medium hover:underline"
                        >
                            {activity.issue.identifier}
                        </Link>
                    </>
                )}
                <div className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
