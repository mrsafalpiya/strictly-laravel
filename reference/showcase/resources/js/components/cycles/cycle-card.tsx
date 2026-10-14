import { Link } from '@inertiajs/react';
import { formatRange } from '@/components/cycles/dates';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { show } from '@/routes/cycles';
import type { CycleData } from '@/types';

export function CycleCard({
    cycle,
    highlight = false,
}: {
    cycle: CycleData;
    highlight?: boolean;
}) {
    const workspace = useWorkspace();
    const percent =
        cycle.issuesCount === 0
            ? 0
            : Math.floor(
                  (cycle.completedIssuesCount / cycle.issuesCount) * 100,
              );

    return (
        <Link
            href={show({ workspace, cycle })}
            className={cn(
                'flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent/50',
                highlight && 'border-foreground/30 p-4',
            )}
        >
            <div className="flex items-baseline justify-between gap-2">
                <span className={cn('font-medium', highlight && 'text-lg')}>
                    {cycle.name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatRange(cycle.startsOn, cycle.endsOn)}
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span>
                    {cycle.completedIssuesCount}/{cycle.issuesCount} done
                </span>
            </div>
        </Link>
    );
}
