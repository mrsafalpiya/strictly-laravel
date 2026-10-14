import { router } from '@inertiajs/react';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps, ReportStatsData } from '@/generated';

const page = forPage<'reports'>();

function Stats({ stats }: { stats: ReportStatsData }) {
    return (
        <p>
            {stats.openIssues} open, {stats.closedIssues} closed
        </p>
    );
}

export default function Reports({
    title,
    stats,
    lastYear,
}: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            <page.Deferred data="stats" fallback={<p>Loading…</p>}>
                {stats !== undefined && <Stats stats={stats} />}
            </page.Deferred>
            {lastYear === undefined ? (
                <button
                    type="button"
                    onClick={() =>
                        router.reload({ only: page.only('lastYear') })
                    }
                >
                    Compare with last year
                </button>
            ) : (
                <Stats stats={lastYear} />
            )}
        </>
    );
}
