import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Backlog({ backlog }: PageProps<'backlog'>) {
    return (
        <>
            <Head title={backlog.column} />
            <ul>
                {backlog.items.map((item) => (
                    <li key={item.title}>{item.title}</li>
                ))}
            </ul>
        </>
    );
}
