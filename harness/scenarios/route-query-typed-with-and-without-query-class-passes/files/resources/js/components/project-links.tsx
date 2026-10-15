import { Link } from '@inertiajs/react';
import {
    archive,
    index,
} from '@/actions/App/Http/Controllers/ProjectController';
import { edit } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { dashboard } from '@/routes';

export default function ProjectLinks() {
    return (
        <nav>
            <Link
                href={index({ query: { statuses: ['active'], sort: 'name' } })}
            >
                Active projects
            </Link>
            <Link href={index({ mergeQuery: { page: 2 } })}>Next page</Link>
            <Link href={archive()}>Archive</Link>
            <Link href={dashboard()}>Dashboard</Link>
            <Link href={edit()}>Profile</Link>
        </nav>
    );
}
