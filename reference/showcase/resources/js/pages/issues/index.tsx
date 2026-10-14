import { Head, Link } from '@inertiajs/react';
import { Bookmark, Plus, X } from 'lucide-react';
import { useState } from 'react';
import {
    filtersToQuery,
    IssueFilters,
} from '@/components/issues/issue-filters';
import { IssueRow } from '@/components/issues/issue-row';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/hooks/use-workspace';
import {
    issuePriorities,
    issuePriorityValues,
    issueStatuses,
    issueStatusValues,
} from '@/lib/domain';
import { bulkUpdate, create, index } from '@/routes/issues';
import { destroy as destroyView, store as storeView } from '@/routes/views';
import type { BulkUpdateIssuesData, PageProps } from '@/types';
import { forPage } from '@/lib/page';
import { submit, visit } from '@/lib/requests';

const page = forPage<'issues/index'>();

export default function IssuesIndex({
    issues,
    filters,
    options,
    savedViews,
}: PageProps<'issues/index'>) {
    const workspace = useWorkspace();
    const [selected, setSelected] = useState<number[]>([]);

    const applyToSelection = (changes: Omit<BulkUpdateIssuesData, 'ids'>) => {
        const payload: BulkUpdateIssuesData = { ids: selected, ...changes };

        submit(bulkUpdate(workspace), payload, {
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    // Saves the current `filters` prop as-is: it is already typed as the nested IssueFiltersData.
    const saveView = () => {
        const name = prompt('Name this view')?.trim();
        if (!name) return;

        submit(
            storeView(workspace),
            { name, filters },
            {
                preserveScroll: true,
                preserveState: true,
                only: page.only('savedViews'),
                onError: (errors) => alert(Object.values(errors).join('\n')),
            },
        );
    };

    return (
        <>
            <Head title="Issues" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Issues</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={saveView}>
                            <Bookmark className="size-4" /> Save view
                        </Button>
                        {workspace.can.contribute && (
                            <Button asChild size="sm">
                                <Link href={create(workspace)}>
                                    <Plus className="size-4" /> New issue
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {savedViews.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-muted-foreground">Views:</span>
                        {savedViews.map((view) => (
                            <span
                                key={view.id}
                                className="flex items-center rounded-md border"
                            >
                                <Link
                                    href={index(workspace, {
                                        query: filtersToQuery(view.filters),
                                    })}
                                    className="rounded-l-md px-2 py-0.5 hover:bg-accent"
                                >
                                    {view.name}
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete view ${view.name}`}
                                    onClick={() =>
                                        confirm(
                                            `Delete view “${view.name}”?`,
                                        ) &&
                                        visit(
                                            destroyView({
                                                workspace,
                                                savedView: view,
                                            }),
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                                only: page.only('savedViews'),
                                            },
                                        )
                                    }
                                    className="rounded-r-md px-1 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <IssueFilters filters={filters} options={options} />

                {selected.length > 0 && (
                    <div className="flex items-center gap-2 rounded-md border bg-accent/40 px-3 py-2 text-sm">
                        <span className="font-medium">
                            {selected.length} selected
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Set status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {issueStatusValues.map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onSelect={() =>
                                            applyToSelection({ status })
                                        }
                                    >
                                        {issueStatuses[status].label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Set priority
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {issuePriorityValues.map((priority) => (
                                    <DropdownMenuItem
                                        key={priority}
                                        onSelect={() =>
                                            applyToSelection({ priority })
                                        }
                                    >
                                        {issuePriorities[priority].label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Assign
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-72 overflow-y-auto">
                                <DropdownMenuItem
                                    onSelect={() =>
                                        applyToSelection({ assigneeId: null })
                                    }
                                >
                                    Unassign
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Members</DropdownMenuLabel>
                                {options.members.map((member) => (
                                    <DropdownMenuItem
                                        key={member.id}
                                        onSelect={() =>
                                            applyToSelection({
                                                assigneeId: member.id,
                                            })
                                        }
                                    >
                                        {member.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => setSelected([])}
                        >
                            Clear selection
                        </Button>
                    </div>
                )}

                <div className="rounded-lg border">
                    {issues.data.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            No issues match these filters.
                        </p>
                    ) : (
                        issues.data.map((issue) => (
                            <IssueRow
                                key={issue.id}
                                issue={issue}
                                selected={selected.includes(issue.id)}
                                onSelectedChange={
                                    workspace.can.contribute
                                        ? (checked) =>
                                              setSelected((ids) =>
                                                  checked
                                                      ? [...ids, issue.id]
                                                      : ids.filter(
                                                            (id) =>
                                                                id !== issue.id,
                                                        ),
                                              )
                                        : undefined
                                }
                            />
                        ))
                    )}
                </div>

                <Pagination paginator={issues} />
            </div>
        </>
    );
}
