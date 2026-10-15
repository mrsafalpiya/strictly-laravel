import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Feed({ entries }: PageProps<'feed'>) {
    return (
        <>
            <Head title="Feed" />
            <ul>
                {entries.data.map((entry) => (
                    <li key={entry.title}>
                        {entry.title}
                        {entry.note !== null && <p>{entry.note.trim()}</p>}
                    </li>
                ))}
            </ul>
        </>
    );
}
