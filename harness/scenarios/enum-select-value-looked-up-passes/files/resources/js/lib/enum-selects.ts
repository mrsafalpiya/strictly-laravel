import { selectedKey } from '@mrsafalpiya/strictly-laravel/routes';
import { enumValues } from '@/generated';
import type { IssuePriority, ProjectStatus } from '@/generated';

/** What a <Select> of statuses hands its onValueChange: a string, read back as a status, or null for "any". */
export function statusFromSelect(value: string): ProjectStatus | null {
    return selectedKey(enumValues.ProjectStatus, value);
}

/** An int-backed enum's select values are its values' strings ("0", "2"): they read back as numbers. */
export function priorityFromSelect(value: string): IssuePriority | null {
    return selectedKey(enumValues.IssuePriority, value);
}
