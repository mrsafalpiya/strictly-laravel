import { Head } from '@inertiajs/react';
import { Field } from '@/components/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/hooks/use-workspace';
import {
    issuePriorities,
    issuePriorityValues,
    issueStatuses,
    issueStatusValues,
} from '@/lib/domain';
import { cn } from '@/lib/utils';
import { store } from '@/routes/issues';
import { isDateOnly } from '@/generated';
import type { PageProps } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';
import { selectedKey } from '@mrsafalpiya/strictly-laravel/routes';

const NONE = '__none';

export default function IssuesCreate({
    defaults,
    options,
}: PageProps<'issues/create'>) {
    const workspace = useWorkspace();
    // The server sends the initial state typed as the request it expects back.
    const form = useRouteForm(store(workspace), defaults);

    // A label that isn't in this workspace is refused per item (`labelIds.0`), not on the list.
    const labelsError =
        form.errors.labelIds ??
        form.data.labelIds
            .map((_, index) => form.errors[`labelIds.${index}`])
            .find((error) => error !== undefined);

    return (
        <>
            <Head title="New issue" />
            <form
                className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.submit();
                }}
            >
                <h1 className="text-xl font-semibold">New issue</h1>

                <Field label="Project" error={form.errors.projectId}>
                    <Select
                        value={
                            form.data.projectId === null
                                ? ''
                                : String(form.data.projectId)
                        }
                        onValueChange={(value) =>
                            form.setData(
                                'projectId',
                                selectedKey(
                                    options.projects.map(
                                        (project) => project.id,
                                    ),
                                    value,
                                ),
                            )
                        }
                    >
                        <SelectTrigger aria-label="Project">
                            <SelectValue placeholder="Choose a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.projects.map((project) => (
                                <SelectItem
                                    key={project.id}
                                    value={String(project.id)}
                                >
                                    {project.key} · {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Title" htmlFor="title" error={form.errors.title}>
                    <Input
                        id="title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        autoFocus
                    />
                </Field>

                <Field
                    label="Description"
                    htmlFor="description"
                    error={form.errors.description}
                >
                    <Textarea
                        id="description"
                        rows={6}
                        value={form.data.description ?? ''}
                        onChange={(event) =>
                            form.setData(
                                'description',
                                event.target.value === ''
                                    ? null
                                    : event.target.value,
                            )
                        }
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Status" error={form.errors.status}>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    issueStatusValues.find(
                                        (status) => status === value,
                                    ) ?? 'todo',
                                )
                            }
                        >
                            <SelectTrigger aria-label="Status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {issueStatusValues.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {issueStatuses[status].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Priority" error={form.errors.priority}>
                        <Select
                            value={String(form.data.priority)}
                            onValueChange={(value) =>
                                form.setData(
                                    'priority',
                                    issuePriorityValues.find(
                                        (priority) =>
                                            priority === Number(value),
                                    ) ?? 0,
                                )
                            }
                        >
                            <SelectTrigger aria-label="Priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {issuePriorityValues.map((priority) => (
                                    <SelectItem
                                        key={priority}
                                        value={String(priority)}
                                    >
                                        {issuePriorities[priority].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Assignee" error={form.errors.assigneeId}>
                        <Select
                            value={
                                form.data.assigneeId === null
                                    ? NONE
                                    : String(form.data.assigneeId)
                            }
                            onValueChange={(value) =>
                                form.setData(
                                    'assigneeId',
                                    selectedKey(
                                        options.members.map(
                                            (member) => member.id,
                                        ),
                                        value,
                                    ),
                                )
                            }
                        >
                            <SelectTrigger aria-label="Assignee">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>Unassigned</SelectItem>
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
                    </Field>

                    <Field
                        label="Estimate"
                        htmlFor="estimate"
                        error={form.errors.estimate}
                    >
                        <Input
                            id="estimate"
                            type="number"
                            min={0}
                            max={100}
                            value={form.data.estimate ?? ''}
                            onChange={(event) =>
                                form.setData(
                                    'estimate',
                                    event.target.value === ''
                                        ? null
                                        : event.target.valueAsNumber,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="Due date"
                        htmlFor="dueOn"
                        error={form.errors.dueOn}
                    >
                        <Input
                            id="dueOn"
                            type="date"
                            value={form.data.dueOn ?? ''}
                            onChange={(event) => {
                                const value = event.target.value;

                                // Cleared means no due date; a half-typed date keeps the last full one.
                                if (value === '') {
                                    form.setData('dueOn', null);
                                } else if (isDateOnly(value)) {
                                    form.setData('dueOn', value);
                                }
                            }}
                        />
                    </Field>

                    <Field label="Cycle" error={form.errors.cycleId}>
                        <Select
                            value={
                                form.data.cycleId === null
                                    ? NONE
                                    : String(form.data.cycleId)
                            }
                            onValueChange={(value) =>
                                form.setData(
                                    'cycleId',
                                    selectedKey(
                                        options.cycles.map((cycle) => cycle.id),
                                        value,
                                    ),
                                )
                            }
                        >
                            <SelectTrigger aria-label="Cycle">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>No cycle</SelectItem>
                                {options.cycles.map((cycle) => (
                                    <SelectItem
                                        key={cycle.id}
                                        value={String(cycle.id)}
                                    >
                                        {cycle.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field label="Labels" error={labelsError}>
                    <div className="flex flex-wrap gap-1.5">
                        {options.labels.map((label) => {
                            const active = form.data.labelIds.includes(
                                label.id,
                            );

                            return (
                                <button
                                    key={label.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() =>
                                        form.setData(
                                            'labelIds',
                                            active
                                                ? form.data.labelIds.filter(
                                                      (id) => id !== label.id,
                                                  )
                                                : [
                                                      ...form.data.labelIds,
                                                      label.id,
                                                  ],
                                        )
                                    }
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-xs',
                                        active && 'border-foreground bg-accent',
                                    )}
                                >
                                    {label.name}
                                </button>
                            );
                        })}
                    </div>
                </Field>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Create issue
                    </Button>
                </div>
            </form>
        </>
    );
}
