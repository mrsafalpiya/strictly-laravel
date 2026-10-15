import type { VisitOptions } from '@inertiajs/core';
import type { CurrentWorkspaceData, IssueListItemData } from '@/generated';

/** The issue a thread belongs to: what the comment routes, nested under it, take from any issue Data class. */
export type CommentedIssue = Pick<IssueListItemData, 'number'> & {
    project: Pick<IssueListItemData['project'], 'key'>;
};

/**
 * What a comment mutation reloads once it redirects back: the page that shows the thread passes its own typed prop
 * names, `{ only: page.only('comments') }`.
 */
export type CommentReload = Pick<VisitOptions, 'only'>;

/** Route args shared by every comment endpoint (all nested under the issue). */
export function issueRoute(
    workspace: CurrentWorkspaceData,
    issue: CommentedIssue,
) {
    return { workspace, project: issue.project, issue };
}

/** The visit options of a comment mutation: keep the scroll position, reload only what the page asked for. */
export function reloadOptions(reload: CommentReload) {
    return { preserveScroll: true, ...reload } satisfies VisitOptions;
}
