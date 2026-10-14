import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { LabelPill } from '@/components/domain/label-pill';
import { PriorityIcon } from '@/components/domain/priority-icon';
import { StatusIcon } from '@/components/domain/status-icon';
import { UserAvatar } from '@/components/domain/user-avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkspace } from '@/hooks/use-workspace';
import { show } from '@/routes/issues';
import type { IssueListItemData } from '@/types';

export function IssueRow({
    issue,
    selected,
    onSelectedChange,
}: {
    issue: IssueListItemData;
    selected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
}) {
    const workspace = useWorkspace();

    return (
        <div className="group flex items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-accent/50">
            {onSelectedChange && (
                <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) =>
                        onSelectedChange(checked === true)
                    }
                    aria-label={`Select ${issue.identifier}`}
                />
            )}
            <PriorityIcon priority={issue.priority} />
            <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                {issue.identifier}
            </span>
            <StatusIcon status={issue.status} />
            <Link
                href={show({ workspace, project: issue.project, issue })}
                className="min-w-0 flex-1 truncate font-medium"
                prefetch
            >
                {issue.title}
            </Link>
            <div className="hidden items-center gap-1 md:flex">
                {issue.labels.map((label) => (
                    <LabelPill key={label.id} label={label} />
                ))}
            </div>
            {issue.commentsCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" /> {issue.commentsCount}
                </span>
            )}
            {issue.dueOn !== null && (
                <span className="w-20 text-right text-xs text-muted-foreground">
                    {new Date(`${issue.dueOn}T00:00:00`).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' },
                    )}
                </span>
            )}
            <UserAvatar user={issue.assignee} />
        </div>
    );
}
