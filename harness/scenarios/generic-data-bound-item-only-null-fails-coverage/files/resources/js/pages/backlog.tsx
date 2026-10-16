// ListingData has no type argument here, so its generated type doesn't compile (TS2314) and the prop reads as any.
// The scenario shows the Contract Coverage gap, which ci:check reaches before tsc.
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Backlog({ backlog }: PageProps<'backlog'>) {
    return (
        <>
            {/* oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-member-access -- the use this scenario shows: a generic Data class with no type argument */}
            <Head title={backlog.column} />
            {/* oxlint-disable-next-line typescript/no-unsafe-member-access -- the use this scenario shows: a generic Data class with no type argument */}
            <p>{backlog.items.length} issues</p>
        </>
    );
}
