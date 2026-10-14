import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

const page = forPage<'reports'>();

export default function Reports({ title, stats }: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            {/* `stats` was renamed from `statistics`; this Deferred was missed. */}
            <page.Deferred data="statistics" fallback={<p>Loading…</p>}>
                <p>{stats?.openIssues} open</p>
            </page.Deferred>
        </>
    );
}
