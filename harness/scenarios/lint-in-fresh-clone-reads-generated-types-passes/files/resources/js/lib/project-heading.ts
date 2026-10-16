import type { ProjectData } from '@/generated';

export function projectHeading(project: ProjectData | null): string {
    return project === null ? 'No project' : `#${project.id} ${project.name}`;
}
