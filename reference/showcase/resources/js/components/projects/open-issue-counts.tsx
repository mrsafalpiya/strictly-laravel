import { StatusIcon } from '@/components/domain/status-icon';
import { issueStatuses, issueStatusValues } from '@/lib/domain';
import type { IssueStatus } from '@/types';

/**
 * Renders an enum-keyed partial map. Iterating `issueStatusValues` (not `Object.keys`) keeps the
 * keys typed as IssueStatus and the order stable; absent keys are simply skipped.
 */
export function OpenIssueCounts({
    counts,
}: {
    counts: Partial<Record<IssueStatus, number>>;
}) {
    const entries = issueStatusValues.flatMap((status) => {
        const count = counts[status];

        return count === undefined ? [] : [{ status, count }];
    });

    return (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {entries.map(({ status, count }) => (
                <li
                    key={status}
                    className="flex items-center gap-1"
                    title={issueStatuses[status].label}
                >
                    <StatusIcon status={status} className="size-3.5" />
                    <span className={count === 0 ? 'opacity-50' : undefined}>
                        {count}
                    </span>
                    <span className="sr-only">
                        {issueStatuses[status].label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
