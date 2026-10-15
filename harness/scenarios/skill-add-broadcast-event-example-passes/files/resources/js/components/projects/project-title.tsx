import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [current, setCurrent] = useState(project);

    useChannelEvent(
        channel('projects.{project}', { project }),
        'ProjectUpdated',
        (updated) => setCurrent(updated),
    );

    return (
        <header>
            <h1>{current.name}</h1>
            {current.description !== null && <p>{current.description}</p>}
        </header>
    );
}
