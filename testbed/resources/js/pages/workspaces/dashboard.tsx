import { Head, Link, usePage } from '@inertiajs/react';
import { ActivityItem } from '@/components/activity/activity-item';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusChart } from '@/components/dashboard/status-chart';
import { ThroughputChart } from '@/components/dashboard/throughput-chart';
import { IssueRow } from '@/components/issues/issue-row';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/hooks/use-workspace';
import { index as activityIndex } from '@/routes/activity';
import { index as issuesIndex } from '@/routes/issues';
import type { PageProps } from '@/generated';

export default function WorkspacesDashboard({
    stats,
    assignedToMe,
    statusCounts,
    throughput,
    recentActivity,
}: PageProps<'workspaces/dashboard'>) {
    const workspace = useWorkspace();
    const { auth } = usePage().props;

    return (
        <>
            <Head title={workspace.name} />
            <div className="flex flex-col gap-6 p-4">
                <h1 className="text-xl font-semibold">{workspace.name}</h1>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="My open issues"
                        value={stats.myOpenIssues}
                        hint="Assigned to you"
                    />
                    <StatCard
                        label="Due soon"
                        value={stats.dueWithinWeek}
                        hint="Yours, due within 7 days"
                    />
                    <StatCard
                        label="Created this week"
                        value={stats.createdThisWeek}
                        hint="In this workspace"
                    />
                    <StatCard
                        label="Completed this week"
                        value={stats.completedThisWeek}
                        hint="Done or canceled"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Issues by status">
                        {/* Deferred ("charts" group): undefined until loaded. */}
                        {statusCounts === undefined ? (
                            <Skeleton className="h-44" />
                        ) : (
                            <StatusChart counts={statusCounts} />
                        )}
                    </Panel>
                    <Panel title="Throughput, last 8 weeks">
                        {throughput === undefined ? (
                            <Skeleton className="h-44" />
                        ) : (
                            <ThroughputChart weeks={throughput} />
                        )}
                    </Panel>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Panel
                        title="Assigned to me"
                        action={
                            auth.user !== null && (
                                <Link
                                    href={issuesIndex(workspace, {
                                        query: { assigneeId: auth.user.id },
                                    })}
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    View all
                                </Link>
                            )
                        }
                    >
                        {assignedToMe.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nothing assigned to you.
                            </p>
                        ) : (
                            <div className="-mx-4 border-t">
                                {assignedToMe.map((issue) => (
                                    <IssueRow key={issue.id} issue={issue} />
                                ))}
                            </div>
                        )}
                    </Panel>
                    <Panel
                        title="Recent activity"
                        action={
                            <Link
                                href={activityIndex(workspace)}
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                View all
                            </Link>
                        }
                    >
                        {recentActivity === undefined ? (
                            <Skeleton className="h-44" />
                        ) : recentActivity.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No activity yet.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {recentActivity.map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ))}
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </>
    );
}

function Panel({
    title,
    action,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}
