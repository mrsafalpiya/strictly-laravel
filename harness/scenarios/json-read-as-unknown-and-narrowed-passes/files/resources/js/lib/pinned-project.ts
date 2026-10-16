import type { ProjectData } from '@/generated';

// Checks every field a ProjectData has, so a value that passes is one.
function isProjectData(value: unknown): value is ProjectData {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'number' &&
        'name' in value &&
        typeof value.name === 'string'
    );
}

// The project pinned on an earlier visit: the saved text is read as unknown and checked.
export function pinnedProject(): ProjectData | null {
    const text = window.localStorage.getItem('pinned-project');

    if (text === null) {
        return null;
    }

    const project: unknown = JSON.parse(text);

    return isProjectData(project) ? project : null;
}

// A response body is read as unknown too, and handed on only once it is checked.
export async function showPreview(
    response: Response,
    show: (project: ProjectData) => void,
): Promise<void> {
    const body: unknown = await response.json();

    if (isProjectData(body)) {
        show(body);
    }
}

export const draftTitle = (text: string): string | null => {
    const draft: unknown = JSON.parse(text);

    return typeof draft === 'object' &&
        draft !== null &&
        'title' in draft &&
        typeof draft.title === 'string'
        ? draft.title
        : null;
};
