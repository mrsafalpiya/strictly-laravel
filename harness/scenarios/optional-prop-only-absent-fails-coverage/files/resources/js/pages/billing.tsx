import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Billing({ seats, discount }: PageProps<'billing'>) {
    return (
        <>
            <Head title="Billing" />
            <p>{seats} seats</p>
            {discount !== undefined && <p>{discount.toFixed(0)}% off</p>}
        </>
    );
}
