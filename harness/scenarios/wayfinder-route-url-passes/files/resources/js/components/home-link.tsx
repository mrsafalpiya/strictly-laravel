import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes';

export function HomeLink() {
    return <Link href={dashboard()}>Dashboard</Link>;
}
