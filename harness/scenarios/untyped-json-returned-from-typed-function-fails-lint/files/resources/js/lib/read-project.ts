import type { ProjectData } from '@/generated';

// Response.json() resolves to any, so the return type is a promise nothing checks.
export async function readProject(response: Response): Promise<ProjectData> {
    return response.json();
}
