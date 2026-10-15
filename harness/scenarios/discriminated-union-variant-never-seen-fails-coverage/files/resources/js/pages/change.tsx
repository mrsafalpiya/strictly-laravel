import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Change({ change }: PageProps<'change'>) {
    return (
        <>
            <Head title="Change" />
            <p>
                {change.type === 'status' ? 'Status' : 'Priority'}:{' '}
                {change.from} → {change.to}
            </p>
        </>
    );
}
