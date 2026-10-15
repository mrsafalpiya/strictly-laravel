import { Head, Link } from '@inertiajs/react';
import { index, show } from '@/actions/App/Http/Controllers/IssueController';
import type { PageProps } from '@/generated';

export default function IssueShow({ issue }: PageProps<'issues/show'>) {
    return (
        <>
            <Head title={issue.title} />
            <Link href={show({ issue: issue.number })}>{issue.title}</Link>
            <Link href={index()}>All issues</Link>
        </>
    );
}
