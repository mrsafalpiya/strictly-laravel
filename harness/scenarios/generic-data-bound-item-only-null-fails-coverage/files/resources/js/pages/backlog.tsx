import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Backlog({ backlog }: PageProps<'backlog'>) {
    return (
        <>
            <Head title={backlog.column} />
            <p>{backlog.items.length} issues</p>
        </>
    );
}
