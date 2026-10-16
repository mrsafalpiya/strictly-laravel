import { Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ActivityItem } from '@/components/activity/activity-item';
import { CommentThread } from '@/components/comments/comment-thread';
import { LabelPill } from '@/components/domain/label-pill';
import { PriorityIcon } from '@/components/domain/priority-icon';
import { StatusIcon } from '@/components/domain/status-icon';
import { AttachmentList } from '@/components/issues/attachment-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/hooks/use-workspace';
import {
    issuePriorities,
    issuePriorityValues,
    issueStatuses,
    issueStatusValues,
} from '@/lib/domain';
import { cn } from '@/lib/utils';
import { destroy, index, show, update } from '@/routes/issues';
import { isDateOnly } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';
import type { PageProps, UpdateIssueData } from '@/generated';
import { forPage, submit, visit } from '@mrsafalpiya/strictly-laravel/react';
import { selectedKey } from '@mrsafalpiya/strictly-laravel/routes';

const page = forPage<'issues/show'>();

const NONE = '__none';

export default function IssuesShow({
    issue,
    comments,
    attachments,
    activity,
    options,
    can,
}: PageProps<'issues/show'>) {
    const workspace = useWorkspace();
    const [title, setTitle] = useState(issue.title);
    const [description, setDescription] = useState(issue.description ?? '');
    const route = { workspace, project: issue.project, issue };

    // Another member's comment on this issue arrives live: reload the thread and the activity entry it adds.
    useChannelEvent(
        channel('workspaces.{workspace}', { workspace }),
        'CommentPosted',
        (posted) => {
            if (posted.issueId !== issue.id) {
                return;
            }

            toast(`${posted.author.name} commented`, {
                description: posted.excerpt,
            });
            router.reload({ only: page.only('comments', 'activity') });
        },
        [issue.id],
    );

    // Every inline edit is a typed partial update: only the keys of UpdateIssueData are allowed.
    const save = (changes: UpdateIssueData) => {
        submit(update(route), changes, {
            preserveScroll: true,
            only: page.only('issue', 'activity'),
        });
    };

    return (
        <>
            <Head title={`${issue.identifier} ${issue.title}`} />
            <div className="grid gap-8 p-4 lg:grid-cols-[1fr_280px]">
                <div className="flex min-w-0 flex-col gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link
                            href={index(workspace, {
                                query: { projectKey: issue.project.key },
                            })}
                            className="hover:underline"
                        >
                            {issue.project.name}
                        </Link>
                        <span>/</span>
                        <span className="font-mono">{issue.identifier}</span>
                        {issue.parent !== null && (
                            <>
                                <span>· sub-issue of</span>
                                <Link
                                    href={show({
                                        workspace,
                                        project: issue.parent.projectKey,
                                        issue: issue.parent.number,
                                    })}
                                    className="hover:underline"
                                >
                                    {issue.parent.identifier}
                                </Link>
                            </>
                        )}
                    </div>

                    <Input
                        value={title}
                        disabled={!can.update}
                        aria-label="Title"
                        onChange={(event) => setTitle(event.target.value)}
                        onBlur={() =>
                            title !== issue.title &&
                            title.trim() !== '' &&
                            save({ title })
                        }
                        className="h-auto border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 md:text-2xl"
                    />

                    <Textarea
                        value={description}
                        disabled={!can.update}
                        aria-label="Description"
                        placeholder="Add a description…"
                        rows={8}
                        onChange={(event) => setDescription(event.target.value)}
                        onBlur={() =>
                            description !== (issue.description ?? '') &&
                            save({
                                description:
                                    description === '' ? null : description,
                            })
                        }
                    />

                    {issue.children.length > 0 && (
                        <section>
                            <h2 className="mb-2 text-sm font-semibold">
                                Sub-issues
                            </h2>
                            <ul className="rounded-lg border">
                                {issue.children.map((child) => (
                                    <li
                                        key={child.id}
                                        className="flex items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                                    >
                                        <StatusIcon status={child.status} />
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {child.identifier}
                                        </span>
                                        <Link
                                            href={show({
                                                workspace,
                                                project: child.projectKey,
                                                issue: child.number,
                                            })}
                                            className="hover:underline"
                                        >
                                            {child.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2 className="mb-2 text-sm font-semibold">
                            Attachments
                        </h2>
                        <AttachmentList
                            issue={issue}
                            attachments={attachments}
                            canUpload={can.update}
                        />
                    </section>

                    <section>
                        <h2 className="mb-3 text-sm font-semibold">Comments</h2>
                        {/* Deferred prop: `comments` is optional in the generated type until it has loaded. */}
                        {comments === undefined ? (
                            <Skeleton className="h-24" />
                        ) : (
                            <CommentThread
                                issue={issue}
                                comments={comments}
                                canComment={can.comment}
                                // A comment is also an activity entry.
                                reload={{
                                    only: page.only('comments', 'activity'),
                                }}
                            />
                        )}
                    </section>

                    <section>
                        <h2 className="mb-1 text-sm font-semibold">Activity</h2>
                        {/* Deferred prop: `activity` is optional in the generated type until it has loaded. */}
                        {activity === undefined ? (
                            <Skeleton className="h-24" />
                        ) : (
                            <div className="divide-y">
                                {activity.map((item) => (
                                    <ActivityItem
                                        key={item.id}
                                        activity={item}
                                        showIssue={false}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="flex flex-col gap-4 text-sm">
                    <Property label="Status">
                        <Select
                            disabled={!can.update}
                            value={issue.status}
                            onValueChange={(value) => {
                                const status = issueStatusValues.find(
                                    (s) => s === value,
                                );
                                if (status) save({ status });
                            }}
                        >
                            <SelectTrigger aria-label="Status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {issueStatusValues.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        <StatusIcon status={status} />{' '}
                                        {issueStatuses[status].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Property>

                    <Property label="Priority">
                        <Select
                            disabled={!can.update}
                            value={String(issue.priority)}
                            onValueChange={(value) => {
                                const priority = issuePriorityValues.find(
                                    (p) => p === Number(value),
                                );
                                if (priority !== undefined) save({ priority });
                            }}
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
                                        <PriorityIcon priority={priority} />{' '}
                                        {issuePriorities[priority].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Property>

                    <Property label="Assignee">
                        <Select
                            disabled={!can.update}
                            value={
                                issue.assignee === null
                                    ? NONE
                                    : String(issue.assignee.id)
                            }
                            onValueChange={(value) =>
                                save({
                                    assigneeId: selectedKey(
                                        options.members.map(
                                            (member) => member.id,
                                        ),
                                        value,
                                    ),
                                })
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
                    </Property>

                    <Property label="Labels">
                        <div className="flex flex-wrap gap-1">
                            {options.labels.map((label) => {
                                const active = issue.labels.some(
                                    (l) => l.id === label.id,
                                );
                                const labelIds = active
                                    ? issue.labels
                                          .filter((l) => l.id !== label.id)
                                          .map((l) => l.id)
                                    : [
                                          ...issue.labels.map((l) => l.id),
                                          label.id,
                                      ];

                                return (
                                    <button
                                        key={label.id}
                                        type="button"
                                        aria-pressed={active}
                                        disabled={!can.update}
                                        onClick={() => save({ labelIds })}
                                        className={cn(
                                            'rounded-full',
                                            !active &&
                                                'opacity-40 hover:opacity-100',
                                        )}
                                    >
                                        <LabelPill label={label} />
                                    </button>
                                );
                            })}
                        </div>
                    </Property>

                    <Property label="Cycle">
                        <Select
                            disabled={!can.update}
                            value={
                                issue.cycle === null
                                    ? NONE
                                    : String(issue.cycle.id)
                            }
                            onValueChange={(value) =>
                                save({
                                    cycleId: selectedKey(
                                        options.cycles.map((cycle) => cycle.id),
                                        value,
                                    ),
                                })
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
                    </Property>

                    <Property label="Due date">
                        <Input
                            type="date"
                            aria-label="Due date"
                            disabled={!can.update}
                            defaultValue={issue.dueOn ?? ''}
                            onBlur={(event) => {
                                const value = event.target.value;
                                // Cleared means no due date; a half-typed date isn't saved.
                                const dueOn =
                                    value === ''
                                        ? null
                                        : isDateOnly(value)
                                          ? value
                                          : undefined;
                                if (
                                    dueOn !== undefined &&
                                    dueOn !== issue.dueOn
                                )
                                    save({ dueOn });
                            }}
                        />
                    </Property>

                    <Property label="Estimate">
                        <Input
                            type="number"
                            aria-label="Estimate"
                            min={0}
                            max={100}
                            disabled={!can.update}
                            defaultValue={issue.estimate ?? ''}
                            onBlur={(event) => {
                                const estimate =
                                    event.target.value === ''
                                        ? null
                                        : event.target.valueAsNumber;
                                if (estimate !== issue.estimate)
                                    save({ estimate });
                            }}
                        />
                    </Property>

                    <div className="text-xs text-muted-foreground">
                        Reported by {issue.reporter.name} on{' '}
                        {new Date(issue.createdAt).toLocaleDateString()}
                        {issue.completedAt !== null &&
                            `, closed on ${new Date(issue.completedAt).toLocaleDateString()}`}
                    </div>

                    {can.delete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                confirm(`Delete ${issue.identifier}?`) &&
                                visit(destroy(route))
                            }
                        >
                            <Trash2 className="size-4" /> Delete issue
                        </Button>
                    )}
                </aside>
            </div>
        </>
    );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            {children}
        </div>
    );
}
