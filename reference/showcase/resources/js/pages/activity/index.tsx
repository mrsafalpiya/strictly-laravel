import { Head } from '@inertiajs/react';
import { ActivityItem } from '@/components/activity/activity-item';
import { ActivityTypeFilter } from '@/components/activity/activity-type-filter';
import { Spinner } from '@/components/ui/spinner';
import { useWorkspace } from '@/hooks/use-workspace';
import { index } from '@/routes/activity';
import type { ActivityType, PageProps } from '@/types';
import { forPage } from '@/lib/page';
import { visit } from '@/lib/requests';

type Props = PageProps<'activity/index'>;

const page = forPage<'activity/index'>();

export default function ActivityIndex({ activity, filters }: Props) {
    const workspace = useWorkspace();

    const filter = (types: ActivityType[]) =>
        visit(index(workspace, { query: { types } }), {
            replace: true,
            // Start the feed over instead of appending the filtered page to the loaded one.
            reset: page.reset('activity'),
        });

    return (
        <>
            <Head title="Activity" />
            <div className="flex max-w-3xl flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">Activity</h1>

                <ActivityTypeFilter value={filters.types} onChange={filter} />

                {activity.data.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        No activity yet.
                    </p>
                ) : (
                    <page.InfiniteScroll
                        data={'activity' satisfies keyof Props}
                        onlyNext
                        preserveUrl
                        buffer={400}
                        className="divide-y rounded-lg border px-4"
                        loading={
                            <div className="flex justify-center py-4">
                                <Spinner />
                            </div>
                        }
                    >
                        {activity.data.map((item) => (
                            <ActivityItem key={item.id} activity={item} />
                        ))}
                    </page.InfiniteScroll>
                )}

                {activity.meta.next_cursor === null &&
                    activity.data.length > 0 && (
                        <p className="text-center text-xs text-muted-foreground">
                            That's everything.
                        </p>
                    )}
            </div>
        </>
    );
}
