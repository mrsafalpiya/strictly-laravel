import { router } from '@inertiajs/react';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

const page = forPage<'reports'>();

export default function Reports({ title, stats }: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            <p>
                {stats === undefined ? 'Loading…' : `${stats.openIssues} open`}
            </p>
            {/* `stats` was renamed from `statistics`; this reload was missed. */}
            <button
                type="button"
                onClick={() => router.reload({ only: page.only('statistics') })}
            >
                Refresh
            </button>
        </>
    );
}
