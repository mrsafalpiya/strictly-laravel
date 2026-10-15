import { Head, Link } from '@inertiajs/react';
import { visit } from '@mrsafalpiya/strictly-laravel/react';
import { index } from '@/actions/App/Http/Controllers/ProjectController';
import { enumValues } from '@/generated';
import type { PageProps } from '@/generated';

export default function Index({
    filters,
    projects,
}: PageProps<'projects/index'>) {
    // The filter UI is typed by the same class the server parses the query string into.
    const sortBy = (value: string) => {
        const sort = enumValues.ProjectSort.find((option) => option === value);

        if (sort !== undefined) {
            visit(index({ query: { ...filters, sort, page: 1 } }));
        }
    };

    return (
        <>
            <Head title="Projects" />
            <select
                value={filters.sort}
                onChange={(event) => sortBy(event.target.value)}
            >
                {enumValues.ProjectSort.map((sort) => (
                    <option key={sort} value={sort}>
                        {sort}
                    </option>
                ))}
            </select>
            {filters.search !== null && <p>Matching “{filters.search}”</p>}
            <Link
                href={index({
                    query: { statuses: ['archived'], includeArchived: true },
                })}
            >
                Archived
            </Link>
            <Link href={index({ query: { ...filters, search: null } })}>
                Clear search
            </Link>
            <Link href={index({ mergeQuery: { page: filters.page + 1 } })}>
                Next page
            </Link>
            <ul>
                {projects.map((project) => (
                    <li key={project}>{project}</li>
                ))}
            </ul>
        </>
    );
}
