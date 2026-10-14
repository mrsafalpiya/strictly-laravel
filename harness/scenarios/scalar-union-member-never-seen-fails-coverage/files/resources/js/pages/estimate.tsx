import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Estimate({ estimate }: PageProps<'estimate'>) {
    return (
        <>
            <Head title="Estimate" />
            <p>
                {typeof estimate === 'number'
                    ? `${estimate.toFixed(0)} points`
                    : estimate}
            </p>
        </>
    );
}
