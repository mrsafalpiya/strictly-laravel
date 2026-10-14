import type { IssuePriority } from '@/generated';

const labels: Record<IssuePriority, string> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
};

export const priorities = Object.keys(labels) as IssuePriority[];
