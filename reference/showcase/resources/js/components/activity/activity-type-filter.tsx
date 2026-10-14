import { cn } from '@/lib/utils';
import type { ActivityType } from '@/types';
import { enumValues } from '@/generated';

/** Chip labels. `satisfies Record<ActivityType, …>`: a new PHP case fails tsc until it is labelled here. */
export const activityTypes = {
    issue_created: 'Created',
    status_changed: 'Status',
    priority_changed: 'Priority',
    assignee_changed: 'Assignee',
    commented: 'Comments',
    member_joined: 'Members',
} as const satisfies Record<ActivityType, string>;

export const activityTypeValues = enumValues.ActivityType;

export function ActivityTypeFilter({
    value,
    onChange,
}: {
    /** Empty means every type. */
    value: ActivityType[];
    onChange: (types: ActivityType[]) => void;
}) {
    const chip = (active: boolean) =>
        cn(
            'rounded-full border px-2.5 py-1 text-xs',
            active ? 'border-foreground bg-accent' : 'hover:bg-accent/50',
        );

    return (
        <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter by type"
        >
            <button
                type="button"
                aria-pressed={value.length === 0}
                className={chip(value.length === 0)}
                onClick={() => onChange([])}
            >
                All
            </button>
            {activityTypeValues.map((type) => {
                const active = value.includes(type);

                return (
                    <button
                        key={type}
                        type="button"
                        aria-pressed={active}
                        className={chip(active)}
                        onClick={() =>
                            onChange(
                                active
                                    ? value.filter((t) => t !== type)
                                    : [...value, type],
                            )
                        }
                    >
                        {activityTypes[type]}
                    </button>
                );
            })}
        </div>
    );
}
