import { Head, Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { StatusIcon } from '@/components/domain/status-icon';
import { BurndownChart } from '@/components/cycles/burndown-chart';
import { CycleFields } from '@/components/cycles/cycle-fields';
import { formatRange } from '@/components/cycles/dates';
import { IssueRow } from '@/components/issues/issue-row';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/hooks/use-workspace';
import { issueStatuses } from '@/lib/domain';
import { destroy, index, update } from '@/routes/cycles';
import type { PageProps } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

export default function CyclesShow({
    cycle,
    statusGroups,
    stats,
    defaults,
}: PageProps<'cycles/show'>) {
    const workspace = useWorkspace();
    const [editing, setEditing] = useState(false);
    const form = useRouteForm(update({ workspace, cycle }), defaults);
    const route = { workspace, cycle };
    const groups = statusGroups.filter((group) => group.issues.length > 0);

    return (
        <>
            <Head title={cycle.name} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <Link
                            href={index(workspace)}
                            className="text-sm text-muted-foreground hover:underline"
                        >
                            Cycles
                        </Link>
                        <h1 className="text-xl font-semibold">{cycle.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {formatRange(cycle.startsOn, cycle.endsOn)} ·{' '}
                            {cycle.issuesCount} issues
                        </p>
                    </div>
                    {workspace.can.manage && !editing && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(true)}
                            >
                                <Pencil className="size-3.5" /> Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    confirm(
                                        `Delete ${cycle.name}? Its issues stay, without a cycle.`,
                                    ) && visit(destroy(route))
                                }
                            >
                                <Trash2 className="size-3.5" /> Delete
                            </Button>
                        </>
                    )}
                </div>

                {editing && (
                    <form
                        className="flex flex-col gap-4 rounded-lg border p-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.submit({
                                preserveScroll: true,
                                onSuccess: () => setEditing(false),
                            });
                        }}
                    >
                        <CycleFields form={form} />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    form.reset();
                                    form.clearErrors();
                                    setEditing(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                        </div>
                    </form>
                )}

                <section className="grid gap-4 rounded-lg border p-4 md:grid-cols-[200px_1fr]">
                    {/* Deferred prop: `stats` is optional in the generated type until it has loaded. */}
                    {stats === undefined ? (
                        <>
                            <Skeleton className="h-24" />
                            <Skeleton className="h-40" />
                        </>
                    ) : (
                        <>
                            <dl className="grid grid-cols-3 gap-2 text-sm md:grid-cols-1">
                                <Stat label="Scope" value={stats.scope} />
                                <Stat
                                    label="Completed"
                                    value={stats.completed}
                                />
                                <Stat
                                    label="Progress"
                                    value={`${stats.percent}%`}
                                />
                            </dl>
                            <BurndownChart cycle={cycle} stats={stats} />
                        </>
                    )}
                </section>

                {groups.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        No issues in this cycle yet.
                    </p>
                ) : (
                    groups.map(({ status, issues }) => (
                        <section key={status} className="flex flex-col gap-2">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                <StatusIcon status={status} />
                                {issueStatuses[status].label}
                                <span className="font-normal text-muted-foreground">
                                    {issues.length}
                                </span>
                            </h2>
                            <div className="rounded-lg border">
                                {issues.map((issue) => (
                                    <IssueRow key={issue.id} issue={issue} />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
        </div>
    );
}
