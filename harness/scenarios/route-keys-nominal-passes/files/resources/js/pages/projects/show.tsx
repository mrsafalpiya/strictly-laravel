import { Head, Link } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ProjectController';
import type { PageProps } from '@/generated';

export default function ProjectShow({ project }: PageProps<'projects/show'>) {
    return (
        <>
            <Head title={project.name} />
            <Link href={show(project)}>{project.name}</Link>
            <Link href={show(project.id)}>{project.name}</Link>
            <Link href={show([project])}>{project.name}</Link>
        </>
    );
}
