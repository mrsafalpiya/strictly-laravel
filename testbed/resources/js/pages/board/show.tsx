import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BoardColumn } from '@/components/board/board-column';
import { moveIssue } from '@/components/board/board-state';
import type { DropTarget } from '@/components/board/board-state';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/hooks/use-workspace';
import { move, show } from '@/routes/board';
import type { PageProps } from '@/generated';
import { forPage, submit, visit } from '@mrsafalpiya/strictly-laravel/react';

const page = forPage<'board/show'>();

const ALL = '__all';

export default function BoardShow({
    columns,
    projects,
    projectKey,
    columnLimit,
}: PageProps<'board/show'>) {
    const workspace = useWorkspace();
    const canMove = workspace.can.contribute;
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

    const dragOver = (target: DropTarget) =>
        setDropTarget((current) =>
            current?.status === target.status && current.index === target.index
                ? current
                : target,
        );

    const endDrag = () => {
        setDraggingId(null);
        setDropTarget(null);
    };

    const drop = (issueId: number, target: DropTarget) => {
        endDrag();

        const result = moveIssue(columns, issueId, target);

        if (result === null) {
            return;
        }

        // The page props change immediately; Inertia puts them back if the request fails.
        submit(
            move({
                workspace,
                project: result.issue.project,
                issue: result.issue,
            }),
            result.payload,
            {
                optimistic: page.optimistic((props) => ({
                    columns:
                        moveIssue(props.columns, issueId, target)?.columns ??
                        props.columns,
                })),
                only: page.only('columns'),
                preserveScroll: true,
                onError: () =>
                    toast.error(`Could not move ${result.issue.identifier}.`),
            },
        );
    };

    return (
        <>
            <Head title="Board" />
            <div className="flex h-full min-h-0 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold">Board</h1>
                    <Select
                        value={projectKey ?? ALL}
                        onValueChange={(value) =>
                            visit(
                                show(workspace, {
                                    query:
                                        value === ALL ? {} : { project: value },
                                }),
                                { preserveScroll: true, replace: true },
                            )
                        }
                    >
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All projects</SelectItem>
                            {projects.map((project) => (
                                <SelectItem
                                    key={project.id}
                                    value={project.key}
                                >
                                    {project.key} · {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <p className="text-xs text-muted-foreground">
                    {canMove
                        ? `Drag cards between columns to change their status. Up to ${columnLimit} issues are shown per column.`
                        : `Up to ${columnLimit} issues are shown per column.`}
                </p>

                <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
                    {columns.map((column) => (
                        <BoardColumn
                            key={column.status}
                            column={column}
                            canMove={canMove}
                            draggingId={draggingId}
                            dropTarget={dropTarget}
                            onDragStart={setDraggingId}
                            onDragEnd={endDrag}
                            onDragOver={dragOver}
                            onDrop={drop}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
