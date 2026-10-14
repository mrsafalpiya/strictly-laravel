import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function SearchResult({ match }: PageProps<'search-result'>) {
    return (
        <>
            <Head title="Search" />
            <p>
                {'name' in match
                    ? `${match.name} (${match.openIssues} open)`
                    : `#${match.number} ${match.title}`}
            </p>
        </>
    );
}
