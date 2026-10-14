import { Link } from '@inertiajs/react';
import { index } from '@/actions/App/Http/Controllers/ProjectController';

export default function OldestProjectsLink() {
    return (
        <Link href={index({ query: { sort: 'oldest' } })}>
            Oldest projects
        </Link>
    );
}
