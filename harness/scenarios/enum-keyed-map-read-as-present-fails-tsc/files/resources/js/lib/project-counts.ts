import type { ProjectCountsData } from '@/generated';

export function archivedCount(counts: ProjectCountsData): number {
    return counts.projectsByStatus.archived;
}
