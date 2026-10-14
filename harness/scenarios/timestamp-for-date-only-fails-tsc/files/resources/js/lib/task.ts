import type { TaskData } from '@/generated';

export function dueToday(title: string): TaskData {
    return { title, dueOn: new Date().toISOString() };
}
