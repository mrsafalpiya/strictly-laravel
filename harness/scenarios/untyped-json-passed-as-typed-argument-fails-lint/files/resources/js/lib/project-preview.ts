import type { ProjectData } from '@/generated';

// Response.json() resolves to any, so the body is handed on as a project unchecked.
export async function showPreview(
    response: Response,
    show: (project: ProjectData) => void,
): Promise<void> {
    show(await response.json());
}
