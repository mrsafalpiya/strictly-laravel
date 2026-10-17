import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Index({ labels }: PageProps<'labels/index'>) {
    return (
        <>
            <Head title="Labels" />
            <ul>
                {labels.map((label) => (
                    <li key={label.name}>{label.name}</li>
                ))}
            </ul>
        </>
    );
}
