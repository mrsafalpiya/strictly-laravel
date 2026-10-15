import { useState } from 'react';
import type { ProjectData, ViewerData } from '@/generated';
import { channel, usePresence } from '@/generated/broadcasting';

export function ProjectViewers({ project }: { project: ProjectData }) {
    const [viewers, setViewers] = useState<ViewerData[]>([]);

    usePresence(channel('projects.{project}.viewers', { project }), {
        here: (members) => setViewers(members),
        joining: (viewer) => setViewers((current) => [...current, viewer]),
        leaving: (viewer) =>
            setViewers((current) =>
                current.filter(({ id }) => id !== viewer.id),
            ),
    });

    return <p>{viewers.map(({ name }) => name).join(', ')}</p>;
}
