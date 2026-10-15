import { Head } from '@inertiajs/react';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import type { PageProps } from '@/generated';

type Props = PageProps<'projects/index'>;

const page = forPage<'projects/index'>();

export default function Index({ projects, stats }: Props) {
    return (
        <>
            <Head title="Projects" />
            <page.Deferred data="stats" fallback={<p>Counting…</p>}>
                {stats !== undefined && (
                    <p>
                        {stats.total} projects, {stats.withoutDescription}{' '}
                        without a description
                    </p>
                )}
            </page.Deferred>
            <page.InfiniteScroll data="projects" onlyNext>
                {projects.data.map((project) => (
                    <article key={project.id}>
                        <h2>{project.name}</h2>
                        {project.description !== null && (
                            <p>{project.description}</p>
                        )}
                    </article>
                ))}
            </page.InfiniteScroll>
        </>
    );
}
