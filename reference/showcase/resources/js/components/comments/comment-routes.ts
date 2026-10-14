import type { VisitOptions } from '@inertiajs/core';
import type { CurrentWorkspaceData, IssueData } from '@/types';
import { forPage } from '@/lib/page';

const page = forPage<'issues/show'>();

/** Route args shared by every comment and attachment endpoint (all nested under the issue). */
export function issueRoute(workspace: CurrentWorkspaceData, issue: IssueData) {
    return { workspace, project: issue.project, issue };
}

/** Comment mutations redirect back to the issue; only the deferred thread is re-sent. */
export const reloadComments = {
    preserveScroll: true,
    only: page.only('comments'),
} satisfies VisitOptions;
