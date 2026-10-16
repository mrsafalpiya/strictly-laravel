import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    bulkUpdate,
    show,
} from '@/actions/App/Http/Controllers/IssueController';
import type { BulkUpdateIssuesData, PageProps } from '@/generated';
import { submit } from '@mrsafalpiya/strictly-laravel/react';

export default function IssuesIndex({
    issues,
    members,
}: PageProps<'issues/index'>) {
    const [selected, setSelected] = useState<BulkUpdateIssuesData['ids']>([]);

    const assign = (assigneeId: BulkUpdateIssuesData['assigneeId']) => {
        submit(bulkUpdate(), { ids: selected, assigneeId });
    };

    return (
        <>
            <Head title="Issues" />
            {issues.map((issue) => (
                <div key={issue.id}>
                    <button
                        type="button"
                        onClick={() => setSelected([...selected, issue.id])}
                    >
                        Select
                    </button>
                    <Link href={show(issue)}>{issue.title}</Link>
                    <Link href={show(issue.number)}>#{issue.number}</Link>
                    {issue.assignee_id !== null && (
                        <button
                            type="button"
                            onClick={() => assign(issue.id)}
                        >
                            Same assignee
                        </button>
                    )}
                </div>
            ))}
            {members.map((member) => (
                <button
                    key={member.id}
                    type="button"
                    onClick={() => assign(member.id)}
                >
                    {member.name}
                </button>
            ))}
            <button type="button" onClick={() => assign(null)}>
                Unassign
            </button>
        </>
    );
}
