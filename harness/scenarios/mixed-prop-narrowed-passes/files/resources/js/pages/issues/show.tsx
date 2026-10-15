import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

function isSourced(meta: unknown): meta is { source: string } {
    return (
        typeof meta === 'object' &&
        meta !== null &&
        'source' in meta &&
        typeof meta.source === 'string'
    );
}

export default function IssueShow({
    issue,
    context,
}: PageProps<'issues/show'>) {
    const fields = Object.entries(issue.customFields);

    return (
        <>
            <Head title={issue.title} />
            <h1>{issue.title}</h1>
            {isSourced(issue.meta) && <p>Imported from {issue.meta.source}</p>}
            {typeof context === 'string' && <p>{context}</p>}
            <dl>
                {fields.map(([name, value]) => (
                    <div key={name}>
                        <dt>{name}</dt>
                        <dd>
                            {typeof value === 'string' ||
                            typeof value === 'number'
                                ? value
                                : JSON.stringify(value)}
                        </dd>
                    </div>
                ))}
            </dl>
        </>
    );
}
