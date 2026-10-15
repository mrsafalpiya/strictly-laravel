import { Head, Link } from '@inertiajs/react';
import { index, show } from '@/actions/App/Http/Controllers/IssueController';
import type { PageProps } from '@/generated';
import type { RouteKey } from '@mrsafalpiya/strictly-laravel/routes';

// RouteKey<'Issue', number> still names the key the issue's routes bind it by: its number.
function IssueLink({ issueKey }: { issueKey: RouteKey<'Issue', number> }) {
    return <Link href={show(issueKey)}>Permalink</Link>;
}

export default function IssueShow({ issue }: PageProps<'issues/show'>) {
    return (
        <>
            <Head title={issue.title} />
            <Link href={show({ issue: issue.number })}>{issue.title}</Link>
            <IssueLink issueKey={issue.number} />
            <Link href={index()}>All issues</Link>
        </>
    );
}
