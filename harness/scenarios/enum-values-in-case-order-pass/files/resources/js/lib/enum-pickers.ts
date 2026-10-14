import { enumValues } from '@/generated';
import type { IssuePriority, ProjectStatus } from '@/generated';

export const priorities: readonly [2, 0, 1] = enumValues.IssuePriority;
export const statuses: readonly ['active', 'archived'] =
    enumValues.ProjectStatus;

export function priorityOptions(): IssuePriority[] {
    return [...enumValues.IssuePriority];
}

export function statusOptions(): ProjectStatus[] {
    return [...enumValues.ProjectStatus];
}
