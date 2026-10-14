import { router } from '@inertiajs/react';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

const page = forPage<'reports'>();

export default function Reports({
    title,
    stars,
    stats,
    members,
}: PageProps<'reports'>) {
    const star = () =>
        router.reload({
            only: page.only('stars', 'auth'),
            reset: page.reset('members'),
            optimistic: page.optimistic((props) => ({
                stars: props.stars + 1,
            })),
        });

    return (
        <>
            <h1>{title}</h1>
            <button type="button" onClick={star}>
                {stars} stars
            </button>
            <button
                type="button"
                onClick={() =>
                    router.reload({ except: page.except('members') })
                }
            >
                Refresh
            </button>
            <page.Deferred data="stats" fallback={<p>Loading…</p>}>
                <p>{stats?.openIssues} open</p>
            </page.Deferred>
            <page.WhenVisible data={['stats', 'stars']} fallback={null}>
                <p>{stats?.closedIssues} closed</p>
            </page.WhenVisible>
            <page.InfiniteScroll data="members">
                {members.map((member) => (
                    <p key={member.email}>{member.name}</p>
                ))}
            </page.InfiniteScroll>
        </>
    );
}
