import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function DashboardStatsLink() {
    return <Link href={dashboard({ mergeQuery: { tab: 'stats' } })}>Stats</Link>;
}
