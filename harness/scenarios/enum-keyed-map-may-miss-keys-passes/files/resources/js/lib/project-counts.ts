import type { ProjectCountsData, ProjectStatus } from '@/generated';

/** No project yet: the server sends no status at all. */
export const empty: ProjectCountsData = { projectsByStatus: {} };

export function projectCount(counts: ProjectCountsData, status: ProjectStatus): number {
    return counts.projectsByStatus[status] ?? 0;
}
