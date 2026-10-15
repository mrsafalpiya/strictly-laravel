import { StatusIcon } from '@/components/domain/status-icon';
import { issueStatuses, issueStatusValues } from '@/lib/domain';
import type { PageProps } from '@/generated';

type StatusCounts = NonNullable<
    PageProps<'workspaces/dashboard'>['statusCounts']
>;

/** Horizontal bars, one per status (single series: one hue, the status icon carries identity). */
export function StatusChart({ counts }: { counts: StatusCounts }) {
    const max = Math.max(
        1,
        ...issueStatusValues.map((status) => counts[status] ?? 0),
    );

    return (
        <ul className="flex flex-col gap-2 text-sm">
            {issueStatusValues.map((status) => (
                <li
                    key={status}
                    className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3"
                    title={`${issueStatuses[status].label}: ${counts[status] ?? 0}`}
                >
                    <span className="flex items-center gap-2 truncate">
                        <StatusIcon status={status} />
                        {issueStatuses[status].label}
                    </span>
                    <span className="h-3 rounded-r-sm bg-muted">
                        <span
                            className="block h-full rounded-r-sm bg-[#2a78d6] dark:bg-[#3987e5]"
                            style={{
                                width: `${((counts[status] ?? 0) / max) * 100}%`,
                            }}
                        />
                    </span>
                    <span className="text-right text-muted-foreground tabular-nums">
                        {counts[status] ?? 0}
                    </span>
                </li>
            ))}
        </ul>
    );
}
