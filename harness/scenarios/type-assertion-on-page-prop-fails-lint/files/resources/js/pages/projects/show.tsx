import { Head } from '@inertiajs/react';
import type { PageProps, ProjectData } from '@/generated';

export default function ProjectShow(props: PageProps<'projects/show'>) {
    // Assumes the import has finished: the cast hides the null the type allows.
    const project = props.project as ProjectData;

    return (
        <>
            <Head title={project.name} />
            <h1>{project.name}</h1>
        </>
    );
}
