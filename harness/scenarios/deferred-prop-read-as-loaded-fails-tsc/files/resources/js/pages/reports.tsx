import type { PageProps } from '@/generated';

export default function Reports({ title, stats }: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            <p>
                {/* The stats arrive after the first render. */}
                {stats.openIssues} open
            </p>
        </>
    );
}
