import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Projects({ names }: PageProps<'projects'>) {
    return (
        <>
            <Head title="Projects" />
            <ul>
                {names.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </>
    );
}
