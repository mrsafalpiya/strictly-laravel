import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Members({ members }: PageProps<'members'>) {
    return (
        <>
            <Head title="Members" />
            <ul>
                {members.map((member) => (
                    <li key={member.email}>
                        {member.name} ({member.email})
                    </li>
                ))}
            </ul>
        </>
    );
}
