import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [name, setName] = useState(project.name);

    // routes/channels.php defines projects.{project}: nothing is broadcast on this one.
    useChannelEvent(
        channel('project.{project}', { project }),
        'ProjectUpdated',
        (updated) => setName(updated.name),
    );

    return <h1>{name}</h1>;
}
