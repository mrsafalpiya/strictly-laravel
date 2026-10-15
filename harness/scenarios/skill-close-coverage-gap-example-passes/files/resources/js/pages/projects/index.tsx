import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

type Props = PageProps<'projects/index'>;

export default function Index({ projects }: Props) {
    return (
        <>
            <Head title="Projects" />
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        <h2>{project.name}</h2>
                        {project.description !== null && (
                            <p>{project.description}</p>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
