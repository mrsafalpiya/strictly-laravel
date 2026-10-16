import type { ProjectData } from '@/generated';

// JSON.parse returns any, so the saved text is trusted to be a project unchecked.
export const pinnedProject = (text: string): ProjectData => {
    const project: ProjectData = JSON.parse(text);

    return project;
};
