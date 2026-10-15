import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { LabelPill } from '@/components/domain/label-pill';
import { PriorityIcon } from '@/components/domain/priority-icon';
import { UserAvatar } from '@/components/domain/user-avatar';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { show } from '@/routes/issues';
import type { IssueListItemData } from '@/generated';

/** The `dataTransfer` type a dragged card carries; its value is the issue id. */
export const ISSUE_DRAG_TYPE = 'application/x-tracklane-issue';

export function BoardCard({
    issue,
    draggable,
    dragging,
    onDragStart,
    onDragEnd,
    onDragOver,
}: {
    issue: IssueListItemData;
    draggable: boolean;
    dragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    /** `after` is true when the pointer is over the lower half of the card. */
    onDragOver: (after: boolean) => void;
}) {
    const workspace = useWorkspace();

    return (
        <div
            data-board-card
            draggable={draggable}
            onDragStart={(event) => {
                event.dataTransfer.setData(ISSUE_DRAG_TYPE, String(issue.id));
                event.dataTransfer.effectAllowed = 'move';
                onDragStart();
            }}
            onDragEnd={onDragEnd}
            onDragOver={(event) => {
                if (!event.dataTransfer.types.includes(ISSUE_DRAG_TYPE)) {
                    return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                onDragOver(event.clientY > rect.top + rect.height / 2);
            }}
            className={cn(
                'flex flex-col gap-2 rounded-md border bg-card p-2.5 text-sm shadow-xs',
                draggable && 'cursor-grab active:cursor-grabbing',
                dragging && 'opacity-40',
            )}
        >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PriorityIcon priority={issue.priority} />
                <span className="font-mono">{issue.identifier}</span>
                <UserAvatar user={issue.assignee} className="ml-auto size-5" />
            </div>
            <Link
                href={show({ workspace, project: issue.project, issue })}
                className="line-clamp-2 font-medium hover:underline"
                draggable={false}
            >
                {issue.title}
            </Link>
            {(issue.labels.length > 0 ||
                issue.commentsCount > 0 ||
                issue.dueOn !== null) && (
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    {issue.labels.map((label) => (
                        <LabelPill key={label.id} label={label} />
                    ))}
                    {issue.commentsCount > 0 && (
                        <span className="flex items-center gap-1">
                            <MessageSquare className="size-3" />
                            {issue.commentsCount}
                        </span>
                    )}
                    {issue.dueOn !== null && (
                        <span className="ml-auto">
                            {new Date(
                                `${issue.dueOn}T00:00:00`,
                            ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
