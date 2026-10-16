import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { bulkUpdate } from '@/actions/App/Http/Controllers/IssueController';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BulkUpdateIssuesData, PageProps } from '@/generated';
import { submit } from '@mrsafalpiya/strictly-laravel/react';

const NONE = 'none';

export default function IssuesIndex({
    issues,
    members,
}: PageProps<'issues/index'>) {
    const [selected, setSelected] = useState<BulkUpdateIssuesData['ids']>([]);

    return (
        <>
            <Head title="Issues" />
            {issues.map((issue) => (
                <button
                    key={issue.id}
                    type="button"
                    onClick={() => setSelected([...selected, issue.id])}
                >
                    {issue.title}
                </button>
            ))}
            <Select
                onValueChange={(value) =>
                    submit(bulkUpdate(), {
                        ids: selected,
                        // A select's value is a string; Number() makes it a plain number, no member's key.
                        assigneeId: value === NONE ? null : Number(value),
                    })
                }
            >
                <SelectTrigger aria-label="Assignee">
                    <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE}>Unassigned</SelectItem>
                    {members.map((member) => (
                        <SelectItem key={member.id} value={String(member.id)}>
                            {member.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}
