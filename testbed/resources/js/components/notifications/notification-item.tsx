import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { UserAvatar } from '@/components/domain/user-avatar';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { show as board } from '@/routes/board';
import { read } from '@/routes/notifications';
import type { NotificationData, UserSummaryData } from '@/generated';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

/** `payload` is a discriminated union on `type`: each case below sees its own payload shape. */
function describe(payload: NotificationData['payload']): {
    actor: UserSummaryData;
    text: string;
    quote: string | null;
} {
    switch (payload.type) {
        case 'issue_assigned':
            return {
                actor: payload.assignedBy,
                text: 'assigned you',
                quote: null,
            };
        case 'comment_added':
            return {
                actor: payload.author,
                text: 'commented on',
                quote: payload.excerpt,
            };
        default:
            // A new NotificationType case in PHP makes this line fail to compile until it is handled above.
            return payload satisfies never;
    }
}

export function NotificationItem({
    notification,
}: {
    notification: NotificationData;
}) {
    const workspace = useWorkspace();
    const { payload } = notification;
    const { actor, text, quote } = describe(payload);
    const unread = notification.readAt === null;

    const markAsRead = () =>
        visit(read({ workspace, notification: notification.id }), {
            preserveScroll: true,
        });

    return (
        <li
            className={cn(
                'flex items-start gap-3 px-4 py-3 text-sm',
                unread && 'bg-accent/40',
            )}
        >
            <UserAvatar user={actor} className="mt-0.5" />
            <div className="min-w-0 flex-1">
                <span className="font-medium">{actor.name}</span> {text}{' '}
                <Link
                    // Notifications are per user, not per workspace: link into the one it came from. Until the
                    // Issues area has an issue page, that is the board of the issue's project.
                    href={board(payload.workspaceSlug, {
                        query: { project: payload.issue.projectKey },
                    })}
                    onClick={() => unread && markAsRead()}
                    className="font-medium hover:underline"
                >
                    <span className="font-mono text-xs">
                        {payload.issue.identifier}
                    </span>{' '}
                    {payload.issue.title}
                </Link>
                {quote !== null && (
                    <p className="mt-1 line-clamp-2 text-muted-foreground">
                        “{quote}”
                    </p>
                )}
                <time
                    dateTime={notification.createdAt}
                    className="mt-1 block text-xs text-muted-foreground"
                >
                    {new Date(notification.createdAt).toLocaleString()}
                </time>
            </div>
            {unread && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Mark as read"
                    onClick={markAsRead}
                >
                    <Check className="size-4" />
                </Button>
            )}
        </li>
    );
}
