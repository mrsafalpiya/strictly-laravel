import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Create({ defaults }: PageProps<'projects/create'>) {
    return (
        <>
            <Head title="New project" />
            <h1>{defaults.name === '' ? 'New project' : defaults.name}</h1>
            <p>{defaults.description ?? 'No description yet'}</p>
        </>
    );
}
