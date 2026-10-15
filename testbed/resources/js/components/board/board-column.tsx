import { StatusIcon } from '@/components/domain/status-icon';
import { issueStatuses } from '@/lib/domain';
import { cn } from '@/lib/utils';
import type { BoardColumnData } from '@/generated';
import { BoardCard, ISSUE_DRAG_TYPE } from './board-card';
import type { DropTarget } from './board-state';

export function BoardColumn({
    column,
    canMove,
    draggingId,
    dropTarget,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}: {
    column: BoardColumnData;
    canMove: boolean;
    draggingId: number | null;
    dropTarget: DropTarget | null;
    onDragStart: (issueId: number) => void;
    onDragEnd: () => void;
    onDragOver: (target: DropTarget) => void;
    onDrop: (issueId: number, target: DropTarget) => void;
}) {
    const { status, issues } = column;
    const targetIndex = dropTarget?.status === status ? dropTarget.index : null;
    const indicator = <div className="h-0.5 rounded-full bg-primary" />;

    return (
        <section
            aria-label={issueStatuses[status].label}
            className={cn(
                'flex max-h-full w-72 shrink-0 flex-col rounded-lg bg-muted/50',
                targetIndex !== null && 'ring-2 ring-primary/40',
            )}
            onDragOver={(event) => {
                if (
                    !canMove ||
                    !event.dataTransfer.types.includes(ISSUE_DRAG_TYPE)
                ) {
                    return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                // Over the column but not over a card (header, empty space): drop at the end.
                if (
                    event.target instanceof Element &&
                    event.target.closest('[data-board-card]') === null
                ) {
                    onDragOver({ status, index: issues.length });
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                const issueId = Number(
                    event.dataTransfer.getData(ISSUE_DRAG_TYPE),
                );
                if (Number.isInteger(issueId) && issueId > 0) {
                    onDrop(issueId, {
                        status,
                        index: targetIndex ?? issues.length,
                    });
                }
            }}
        >
            <header className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                <StatusIcon status={status} />
                {issueStatuses[status].label}
                <span className="text-muted-foreground">{column.total}</span>
            </header>
            <div className="flex min-h-16 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {issues.map((issue, index) => (
                    <div key={issue.id} className="flex flex-col gap-2">
                        {targetIndex === index && indicator}
                        <BoardCard
                            issue={issue}
                            draggable={canMove}
                            dragging={draggingId === issue.id}
                            onDragStart={() => onDragStart(issue.id)}
                            onDragEnd={onDragEnd}
                            onDragOver={(after) =>
                                onDragOver({
                                    status,
                                    index: after ? index + 1 : index,
                                })
                            }
                        />
                    </div>
                ))}
                {targetIndex === issues.length && indicator}
                {column.hiddenCount > 0 && (
                    <p className="px-1 py-1 text-xs text-muted-foreground">
                        + {column.hiddenCount} more not shown
                    </p>
                )}
                {issues.length === 0 && targetIndex === null && (
                    <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                        No issues
                    </p>
                )}
            </div>
        </section>
    );
}
