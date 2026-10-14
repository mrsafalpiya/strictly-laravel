import type {
    BoardColumnData,
    IssueListItemData,
    IssueStatus,
    MoveIssueData,
} from '@/types';

/** Where a dragged card would land: before the card currently at `index` of the `status` column. */
export type DropTarget = { status: IssueStatus; index: number };

export type Move = {
    columns: BoardColumnData[];
    issue: IssueListItemData;
    payload: MoveIssueData;
};

/**
 * Moves an issue between (or within) columns, returning the new columns and the request that
 * tells the server the same thing. Pure, so it can run inside `page.optimistic()`.
 * Returns null when the drop would not change anything.
 */
export function moveIssue(
    columns: BoardColumnData[],
    issueId: number,
    target: DropTarget,
): Move | null {
    const source = columns.find((column) =>
        column.issues.some((issue) => issue.id === issueId),
    );
    const issue = source?.issues.find((candidate) => candidate.id === issueId);

    if (source === undefined || issue === undefined) {
        return null;
    }

    const from = source.issues.indexOf(issue);
    // Indexes past the dragged card shift by one once it has been taken out of its own column.
    const index =
        source.status === target.status && target.index > from
            ? target.index - 1
            : target.index;

    if (source.status === target.status && index === from) {
        return null;
    }

    const moved: IssueListItemData = { ...issue, status: target.status };
    let destination: IssueListItemData[] = [];

    const next = columns.map((column): BoardColumnData => {
        if (
            column.status !== source.status &&
            column.status !== target.status
        ) {
            return column;
        }

        const issues = column.issues.filter(
            (candidate) => candidate.id !== issueId,
        );

        if (column.status === target.status) {
            issues.splice(index, 0, moved);
            destination = issues;
        }

        const total =
            column.total +
            (column.status === target.status ? 1 : 0) -
            (column.status === source.status ? 1 : 0);

        return { ...column, issues, total };
    });

    const position = destination.indexOf(moved);

    return {
        columns: next,
        issue: moved,
        payload: {
            status: target.status,
            position,
            beforeId: destination[position + 1]?.id ?? null,
            afterId: destination[position - 1]?.id ?? null,
        },
    };
}
