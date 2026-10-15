import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Index({ projects }: PageProps<'projects/index'>) {
    return (
        <>
            <Head title="Projects" />
            <ul>
                {projects.map((project) => (
                    <li key={project.name}>
                        {project.name}:{' '}
                        {project.lead === null
                            ? 'no lead'
                            : `led by ${project.lead.toUpperCase()}`}
                    </li>
                ))}
            </ul>
        </>
    );
}
