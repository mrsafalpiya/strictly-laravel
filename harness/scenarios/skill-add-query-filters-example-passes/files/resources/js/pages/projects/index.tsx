import { Head, Link } from '@inertiajs/react';
import { visit } from '@mrsafalpiya/strictly-laravel/react';
import { enumValues } from '@/generated';
import type { PageProps } from '@/generated';
import { index } from '@/routes/projects';

type Props = PageProps<'projects/index'>;

export default function Index({ projects, filters }: Props) {
    const search = (value: string) => {
        const query = { ...filters, search: value === '' ? null : value };

        visit(index({ query }), { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Projects" />
            <input
                type="search"
                defaultValue={filters.search ?? ''}
                onChange={(event) => search(event.target.value)}
            />
            <nav>
                {enumValues.ProjectSort.map((sort) => (
                    <Link
                        key={sort}
                        href={index({ query: { ...filters, sort } })}
                    >
                        {sort}
                    </Link>
                ))}
            </nav>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>{project.name}</li>
                ))}
            </ul>
        </>
    );
}
