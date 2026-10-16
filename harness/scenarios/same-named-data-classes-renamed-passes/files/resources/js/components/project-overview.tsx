import type { IssueSummaryData, SummaryData } from '@/generated';

export default function ProjectOverview({
    project,
    issues,
}: {
    project: SummaryData;
    issues: IssueSummaryData;
}) {
    return (
        <p>
            {project.name} ({project.members} members): {issues.open} open,{' '}
            {issues.closed} closed
        </p>
    );
}
