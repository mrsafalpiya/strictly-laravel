import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { StatusIcon } from '@/components/domain/status-icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/hooks/use-workspace';
import {
    issuePriorities,
    issuePriorityValues,
    issueSorts,
    issueSortValues,
    issueStatuses,
    issueStatusValues,
} from '@/lib/domain';
import { cn } from '@/lib/utils';
import { index } from '@/routes/issues';
import type { IssueFiltersData, IssueFormOptionsData } from '@/generated';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

const ALL = '__all';

/** Only non-default values go into the URL, so links stay short and shareable. */
export function filtersToQuery(
    filters: IssueFiltersData,
): Partial<IssueFiltersData> {
    return {
        ...(filters.search !== null && { search: filters.search }),
        ...(filters.statuses.length > 0 && { statuses: filters.statuses }),
        ...(filters.priorities.length > 0 && {
            priorities: filters.priorities,
        }),
        ...(filters.labelIds.length > 0 && { labelIds: filters.labelIds }),
        ...(filters.assigneeId !== null && { assigneeId: filters.assigneeId }),
        ...(filters.projectKey !== null && { projectKey: filters.projectKey }),
        ...(filters.sort !== 'newest' && { sort: filters.sort }),
        ...(filters.includeClosed && { includeClosed: true }),
    };
}

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}

export function IssueFilters({
    filters,
    options,
}: {
    filters: IssueFiltersData;
    options: IssueFormOptionsData;
}) {
    const workspace = useWorkspace();
    const [search, setSearch] = useState(filters.search ?? '');

    // The query is typed by the action's query class: a misspelled filter or a wrong value fails tsc.
    const apply = (changes: Partial<IssueFiltersData>) => {
        visit(
            index(workspace, {
                query: filtersToQuery({ ...filters, ...changes }),
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <form
                    className="relative w-64"
                    onSubmit={(event) => {
                        event.preventDefault();
                        apply({
                            search: search.trim() === '' ? null : search.trim(),
                        });
                    }}
                >
                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search issues…"
                        aria-label="Search issues"
                        className="pl-8"
                    />
                </form>

                <Select
                    value={filters.projectKey ?? ALL}
                    onValueChange={(value) =>
                        apply({ projectKey: value === ALL ? null : value })
                    }
                >
                    <SelectTrigger className="w-40" aria-label="Project">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All projects</SelectItem>
                        {options.projects.map((project) => (
                            <SelectItem key={project.id} value={project.key}>
                                {project.key} · {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={
                        filters.assigneeId === null
                            ? ALL
                            : String(filters.assigneeId)
                    }
                    onValueChange={(value) =>
                        apply({
                            assigneeId: value === ALL ? null : Number(value),
                        })
                    }
                >
                    <SelectTrigger className="w-44" aria-label="Assignee">
                        <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Anyone</SelectItem>
                        {options.members.map((member) => (
                            <SelectItem
                                key={member.id}
                                value={String(member.id)}
                            >
                                {member.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.sort}
                    onValueChange={(value) =>
                        apply({
                            sort:
                                issueSortValues.find(
                                    (sort) => sort === value,
                                ) ?? 'newest',
                        })
                    }
                >
                    <SelectTrigger className="w-44" aria-label="Sort">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {issueSortValues.map((sort) => (
                            <SelectItem key={sort} value={sort}>
                                {issueSorts[sort]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={filters.includeClosed}
                        onCheckedChange={(checked) =>
                            apply({ includeClosed: checked === true })
                        }
                    />
                    Show closed
                </label>

                {Object.keys(filtersToQuery(filters)).length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => visit(index(workspace))}
                    >
                        <X className="size-4" /> Clear
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                {issueStatusValues.map((status) => (
                    <button
                        key={status}
                        type="button"
                        aria-pressed={filters.statuses.includes(status)}
                        onClick={() =>
                            apply({
                                statuses: toggle(filters.statuses, status),
                            })
                        }
                        className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
                            filters.statuses.includes(status) &&
                                'border-foreground bg-accent',
                        )}
                    >
                        <StatusIcon status={status} className="size-3.5" />
                        {issueStatuses[status].label}
                    </button>
                ))}
                <span className="mx-1 h-4 w-px bg-border" />
                {issuePriorityValues.map((priority) => (
                    <button
                        key={priority}
                        type="button"
                        aria-pressed={filters.priorities.includes(priority)}
                        onClick={() =>
                            apply({
                                priorities: toggle(
                                    filters.priorities,
                                    priority,
                                ),
                            })
                        }
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-xs',
                            filters.priorities.includes(priority) &&
                                'border-foreground bg-accent',
                        )}
                    >
                        {issuePriorities[priority].short}
                    </button>
                ))}
                {options.labels.length > 0 && (
                    <span className="mx-1 h-4 w-px bg-border" />
                )}
                {options.labels.map((label) => (
                    <button
                        key={label.id}
                        type="button"
                        aria-pressed={filters.labelIds.includes(label.id)}
                        onClick={() =>
                            apply({
                                labelIds: toggle(filters.labelIds, label.id),
                            })
                        }
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-xs',
                            filters.labelIds.includes(label.id) &&
                                'border-foreground bg-accent',
                        )}
                    >
                        {label.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
