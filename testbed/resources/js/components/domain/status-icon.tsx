import {
    Circle,
    CircleCheck,
    CircleDashed,
    CircleDot,
    CircleSlash,
    CircleEllipsis,
} from 'lucide-react';
import { issueStatuses } from '@/lib/domain';
import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/generated';

const icons = {
    backlog: CircleDashed,
    todo: Circle,
    in_progress: CircleDot,
    in_review: CircleEllipsis,
    done: CircleCheck,
    canceled: CircleSlash,
} satisfies Record<IssueStatus, unknown>;

export function StatusIcon({
    status,
    className,
}: {
    status: IssueStatus;
    className?: string;
}) {
    const Icon = icons[status];

    return (
        <Icon
            aria-label={issueStatuses[status].label}
            className={cn(
                'size-4 shrink-0',
                issueStatuses[status].className,
                className,
            )}
        />
    );
}
