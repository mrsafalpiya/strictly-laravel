import { Head, Link } from '@inertiajs/react';
import { show as showIssue } from '@/actions/App/Http/Controllers/IssueController';
import { show as showProject } from '@/actions/App/Http/Controllers/ProjectController';
import type { PageProps } from '@/generated';

export default function IssueShow({ issue }: PageProps<'issues/show'>) {
    return (
        <>
            <Head title={issue.title} />
            <Link href={showIssue(issue)}>{issue.title}</Link>
            <Link href={showProject(issue.project_id)}>Project</Link>
            <Link href={showProject({ project: issue.project_id })}>
                Project
            </Link>
        </>
    );
}
