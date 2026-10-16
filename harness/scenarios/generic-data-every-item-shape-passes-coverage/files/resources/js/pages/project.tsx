import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Project({ project }: PageProps<'project'>) {
    return (
        <>
            <Head title={project.name} />
            <ul>
                {project.backlog.items.map((issue) => (
                    <li key={issue.number}>
                        {issue.title}
                        {issue.assignee !== null && (
                            <p>{issue.assignee.trim()}</p>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
