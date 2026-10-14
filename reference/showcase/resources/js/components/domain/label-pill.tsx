import { colors } from '@/lib/domain';
import { cn } from '@/lib/utils';
import type { LabelData } from '@/types';

export function LabelPill({
    label,
    className,
}: {
    label: LabelData;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs',
                className,
            )}
        >
            <span className={cn('size-2 rounded-full', colors[label.color])} />
            {label.name}
        </span>
    );
}
