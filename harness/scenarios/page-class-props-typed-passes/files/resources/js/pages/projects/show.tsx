import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Show({ project, status }: PageProps<'projects/show'>) {
    const open: number = project.openIssues;

    return (
        <>
            <Head title={project.name} />
            {status !== null && <p>{status}</p>}
            <h1>
                {project.name} ({open} open)
            </h1>
        </>
    );
}
