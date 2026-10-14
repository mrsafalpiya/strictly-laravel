import { Pagination } from '@mrsafalpiya/strictly-laravel/react';
import type { ProjectIndexData } from '@/generated';

export default function ProjectIndex({ projects, recent }: ProjectIndexData) {
    const pages: (number | null)[] = projects.links.map((link) => link.page);

    return (
        <div>
            <ul>
                {projects.data.map((project) => (
                    <li key={project.id}>{project.name}</li>
                ))}
            </ul>
            <Pagination paginator={projects} className="flex gap-1" linkClassName={(link) => (link.active ? 'font-medium' : '')} />
            <p>{pages.length} page links</p>
            <ul>
                {recent.data.map((project) => (
                    <li key={project.id}>{project.name}</li>
                ))}
            </ul>
            <p>{recent.meta.next_cursor ?? 'no more'}</p>
        </div>
    );
}
