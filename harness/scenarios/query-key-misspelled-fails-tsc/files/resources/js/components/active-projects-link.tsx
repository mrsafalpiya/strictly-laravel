import { Link } from '@inertiajs/react';
import { index } from '@/actions/App/Http/Controllers/ProjectController';

export default function ActiveProjectsLink() {
    return (
        <Link href={index({ query: { statuse: ['active'] } })}>
            Active projects
        </Link>
    );
}
