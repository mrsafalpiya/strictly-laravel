// ListingData has no type argument here, so its generated type doesn't compile (TS2314) and the prop reads as any.
// The scenario shows the Contract Coverage gap, which ci:check reaches before tsc.
/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access -- the use this scenario shows: a generic Data class with no type argument */
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
