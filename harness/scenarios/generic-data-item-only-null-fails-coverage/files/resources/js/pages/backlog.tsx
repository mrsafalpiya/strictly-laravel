import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Backlog({ backlog }: PageProps<'backlog'>) {
    return (
        <>
            <Head title={backlog.column} />
            <ul>
                {backlog.items.map((issue) => (
                    <li key={issue.number}>
                        {issue.title}
                        {issue.assignee !== null && (
                            <p>{issue.assignee.trim()}</p>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
