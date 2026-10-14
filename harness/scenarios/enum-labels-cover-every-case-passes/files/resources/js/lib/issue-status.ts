import type { IssueStatus } from '@/generated';

export const issueStatusLabels = {
    todo: 'To do',
    in_progress: 'In progress',
    done: 'Done',
} satisfies Record<IssueStatus, string>;
