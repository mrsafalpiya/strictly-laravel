import { isDateOnly } from '@/generated';
import type { DateOnly, TaskData } from '@/generated';

/** An `<input type="date">` value, or null when it isn't a calendar date. */
export function dueOnFromInput(value: string): DateOnly | null {
    return isDateOnly(value) ? value : null;
}

export function isOverdue(task: TaskData, today: DateOnly): boolean {
    return task.dueOn < today;
}

export function createdAt(task: TaskData): Date {
    return new Date(task.createdAt);
}
