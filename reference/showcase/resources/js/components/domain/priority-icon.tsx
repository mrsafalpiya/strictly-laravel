import { issuePriorities } from '@/lib/domain';
import { cn } from '@/lib/utils';
import type { IssuePriority } from '@/types';

/** Signal-strength bars; urgent is a red exclamation mark. */
export function PriorityIcon({
    priority,
    className,
}: {
    priority: IssuePriority;
    className?: string;
}) {
    const label = issuePriorities[priority].label;

    if (priority === 4) {
        return (
            <span
                aria-label={label}
                className={cn(
                    'inline-flex size-4 items-center justify-center rounded-sm bg-red-500 text-[10px] font-bold text-white',
                    className,
                )}
            >
                !
            </span>
        );
    }

    return (
        <span
            aria-label={label}
            className={cn('inline-flex size-4 items-end gap-px', className)}
        >
            {[1, 2, 3].map((bar) => (
                <span
                    key={bar}
                    className={cn(
                        'w-1 rounded-sm',
                        bar <= priority
                            ? 'bg-foreground'
                            : 'bg-muted-foreground/30',
                    )}
                    style={{ height: `${bar * 33}%` }}
                />
            ))}
        </span>
    );
}
