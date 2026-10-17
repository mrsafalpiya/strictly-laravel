import type { IssuePriority } from '@/generated';

/** What a <Select> of priorities hands its onValueChange: a string. */
export function priorityFromSelect(value: string): IssuePriority {
    return Number(value);
}
