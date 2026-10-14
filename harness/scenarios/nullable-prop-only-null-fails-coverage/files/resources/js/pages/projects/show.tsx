import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Show({ project }: PageProps<'projects/show'>) {
    return (
        <>
            <Head title={project.name} />
            <h1>{project.name}</h1>
            <p>
                {project.lead === null
                    ? 'No lead'
                    : `Led by ${project.lead.toUpperCase()}`}
            </p>
        </>
    );
}
