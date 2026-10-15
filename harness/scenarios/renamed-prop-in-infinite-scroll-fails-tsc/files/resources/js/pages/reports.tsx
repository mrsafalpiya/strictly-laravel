import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

const page = forPage<'reports'>();

export default function Reports({ title, history }: PageProps<'reports'>) {
    return (
        <>
            <h1>{title}</h1>
            {/* `history` was renamed from `snapshots`; this InfiniteScroll was missed. */}
            <page.InfiniteScroll data="snapshots">
                {history.data.map((snapshot, index) => (
                    <p key={index}>{snapshot.openIssues} open</p>
                ))}
            </page.InfiniteScroll>
        </>
    );
}
