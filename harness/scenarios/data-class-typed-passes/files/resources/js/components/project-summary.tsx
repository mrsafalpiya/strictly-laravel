import type { ProjectData } from '@/generated';

export default function ProjectSummary({ project }: { project: ProjectData }) {
    const open: number = project.openIssues;

    return (
        <p>
            {project.name}: {open} open issues
        </p>
    );
}
