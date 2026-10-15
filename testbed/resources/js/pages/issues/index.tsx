import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { IssueFilters } from '@/components/issues/issue-filters';
import { IssueRow } from '@/components/issues/issue-row';
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
import { bulkUpdate, create } from '@/routes/issues';
import type { BulkUpdateIssuesData, PageProps } from '@/generated';
import { Pagination, submit } from '@mrsafalpiya/strictly-laravel/react';

export default function IssuesIndex({
    issues,
    filters,
    options,
}: PageProps<'issues/index'>) {
    const workspace = useWorkspace();
    const [selected, setSelected] = useState<number[]>([]);

    // The payload is the bulk action's input class: only status, priority and assigneeId can be set.
    const applyToSelection = (changes: Omit<BulkUpdateIssuesData, 'ids'>) => {
        submit(
            bulkUpdate(workspace),
            { ids: selected, ...changes },
            {
                preserveScroll: true,
                onSuccess: () => setSelected([]),
            },
        );
    };

    return (
        <>
            <Head title="Issues" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Issues</h1>
                    {workspace.can.contribute && (
                        <Button asChild size="sm">
                            <Link href={create(workspace)}>
                                <Plus className="size-4" /> New issue
                            </Link>
                        </Button>
                    )}
                </div>

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

                <div className="flex items-center justify-between gap-4 text-sm">
                    {issues.meta.total > 0 && (
                        <p className="text-muted-foreground">
                            {issues.meta.from}–{issues.meta.to} of{' '}
                            {issues.meta.total}
                        </p>
                    )}
                    <Pagination
                        paginator={issues}
                        className="flex gap-1"
                        linkClassName={(link) =>
                            link.url === null
                                ? 'rounded-md px-2.5 py-1 text-muted-foreground/50'
                                : link.active
                                  ? 'rounded-md bg-accent px-2.5 py-1 font-medium'
                                  : 'rounded-md px-2.5 py-1 hover:bg-accent'
                        }
                    />
                </div>
            </div>
        </>
    );
}
