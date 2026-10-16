import { Head } from '@inertiajs/react';
import type { PageProps, ProjectData } from '@/generated';

// The project pinned on an earlier visit, as this page saved it.
function pinnedProject(): ProjectData | null {
    const text = window.localStorage.getItem('pinned-project');

    if (text === null) {
        return null;
    }

    // JSON.parse returns any, so the saved text is trusted to be a project unchecked.
    const project: ProjectData = JSON.parse(text);

    return project;
}

export default function ProjectShow({ project }: PageProps<'projects/show'>) {
    const pinned = pinnedProject();

    return (
        <>
            <Head title={project.name} />
            <h1>{project.name}</h1>
            {pinned !== null && <p>Pinned: {pinned.name}</p>}
        </>
    );
}
