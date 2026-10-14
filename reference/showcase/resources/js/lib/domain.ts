import { enumValues } from '@/generated';
import type {
    Color,
    IssuePriority,
    IssueSort,
    IssueStatus,
    WorkspaceRole,
} from '@/types';

/*
 * Presentation metadata for PHP enums. Each map is `satisfies Record<Enum, …>`, so adding a
 * case to the PHP enum fails `tsc` here until it gets a label: the UI can't silently miss one.
 */

export const issueStatuses = {
    backlog: { label: 'Backlog', className: 'text-muted-foreground' },
    todo: { label: 'Todo', className: 'text-foreground' },
    in_progress: { label: 'In progress', className: 'text-amber-500' },
    in_review: { label: 'In review', className: 'text-violet-500' },
    done: { label: 'Done', className: 'text-emerald-500' },
    canceled: {
        label: 'Canceled',
        className: 'text-muted-foreground line-through',
    },
} as const satisfies Record<IssueStatus, { label: string; className: string }>;

export const issuePriorities = {
    0: { label: 'No priority', short: '—' },
    1: { label: 'Low', short: 'Low' },
    2: { label: 'Medium', short: 'Med' },
    3: { label: 'High', short: 'High' },
    4: { label: 'Urgent', short: 'Urgent' },
} as const satisfies Record<IssuePriority, { label: string; short: string }>;

export const issueSorts = {
    newest: 'Newest',
    oldest: 'Oldest',
    priority: 'Priority',
    due_date: 'Due date',
    updated: 'Recently updated',
} as const satisfies Record<IssueSort, string>;

export const workspaceRoles = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    guest: 'Guest',
} as const satisfies Record<WorkspaceRole, string>;

export const colors = {
    slate: 'bg-slate-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    pink: 'bg-pink-500',
} as const satisfies Record<Color, string>;

// Ordered lists for pickers, generated from the PHP enums (case order).
export const issueStatusValues = enumValues.IssueStatus;
export const issuePriorityValues = enumValues.IssuePriority;
export const issueSortValues = enumValues.IssueSort;
export const workspaceRoleValues = enumValues.WorkspaceRole;
export const colorValues = enumValues.Color;

/**
 * The given values, checked to be every member of `T` — for literal unions that aren't PHP enums
 * (`allOf<WeekStart>()('monday', 'sunday')` fails to compile when a member is missing).
 */
export const allOf =
    <T extends string | number>() =>
    <const V extends readonly T[]>(
        ...values: V &
            ([Exclude<T, V[number]>] extends [never]
                ? unknown
                : { missing: Exclude<T, V[number]> })
    ): readonly T[] =>
        values;
