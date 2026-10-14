import { router } from '@inertiajs/react';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

const page = forPage<'reports'>();

export default function Reports({ title, report }: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            <h2>{report.name}</h2>
            <p>
                {report.stats === undefined
                    ? 'Loading…'
                    : `${report.stats.openIssues} open`}
            </p>
            <button
                type="button"
                onClick={() =>
                    router.reload({ only: page.only('report.stats') })
                }
            >
                Refresh the stats
            </button>
            <button
                type="button"
                onClick={() => router.reload({ except: page.except('title') })}
            >
                Refresh the report
            </button>
        </>
    );
}
