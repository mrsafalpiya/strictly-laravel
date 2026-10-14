import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function ProjectCounts({
    projectsByStatus,
    projectsByLead,
}: PageProps<'project-counts'>) {
    return (
        <>
            <Head title="Projects" />
            <p>{projectsByStatus.active ?? 0} active</p>
            <ul>
                {Object.entries(projectsByLead).map(([lead, count]) => (
                    <li key={lead}>
                        {lead}: {count}
                    </li>
                ))}
            </ul>
        </>
    );
}
