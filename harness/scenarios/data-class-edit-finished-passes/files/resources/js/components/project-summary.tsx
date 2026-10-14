import type { ProjectData } from '@/generated';

export default function ProjectSummary({ project }: { project: ProjectData }) {
    return (
        <p>
            {project.name}, led by {project.lead}: {project.openIssues} open
            issues
        </p>
    );
}
