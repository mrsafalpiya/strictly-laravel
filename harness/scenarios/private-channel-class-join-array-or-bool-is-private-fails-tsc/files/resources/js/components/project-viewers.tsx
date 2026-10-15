import type { ProjectData } from '@/generated';
import { channel, usePresence } from '@/generated/broadcasting';

export function ProjectViewers({ project }: { project: ProjectData }) {
    // projects.{project}'s channel class returns array|bool: a private channel, which has no members to follow.
    usePresence(channel('projects.{project}', { project }), {});

    return null;
}
