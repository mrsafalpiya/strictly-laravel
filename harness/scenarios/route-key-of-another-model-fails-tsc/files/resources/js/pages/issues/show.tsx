import { Head, Link } from '@inertiajs/react';
import { show as showProject } from '@/actions/App/Http/Controllers/ProjectController';
import type { PageProps } from '@/generated';

export default function IssueShow({ issue }: PageProps<'issues/show'>) {
    return (
        <>
            <Head title={issue.title} />
            <Link href={showProject(issue)}>Project</Link>
        </>
    );
}
