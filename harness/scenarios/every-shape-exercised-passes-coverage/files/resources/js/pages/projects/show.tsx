import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Show({
    project,
    members,
    focus,
    estimate,
    openIssues,
}: PageProps<'projects/show'>) {
    return (
        <>
            <Head title={project.name} />
            <h1>{project.name}</h1>
            <p>
                {project.lead === null ? 'No lead' : `Led by ${project.lead}`}
            </p>
            <p>
                {'number' in focus
                    ? `Next: #${focus.number} ${focus.title}`
                    : `Next: ${focus.title}, due ${focus.due}`}
            </p>
            <p>
                {typeof estimate === 'number'
                    ? `${estimate.toFixed(0)} points`
                    : estimate}
            </p>
            {openIssues !== undefined && <p>{openIssues} open issues</p>}
            <ul>
                {members.map((member) => (
                    <li key={member.email}>{member.name}</li>
                ))}
            </ul>
        </>
    );
}
